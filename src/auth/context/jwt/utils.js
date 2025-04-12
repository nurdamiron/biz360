import { paths } from 'src/routes/paths';
import axios from 'src/lib/axios';
import { JWT_STORAGE_KEY } from './constant';

// Определяем константу для ключа refreshToken в localStorage
const REFRESH_TOKEN_STORAGE_KEY = 'jwt_refresh_token';

// ----------------------------------------------------------------------

export function jwtDecode(token) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) {
      console.error('Invalid token format, not enough parts:', token);
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    try {
      const decoded = JSON.parse(atob(base64));
      return decoded;
    } catch (parseError) {
      console.error('Error parsing token JSON:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Error decoding token:', error);
    return null; // Return null instead of throwing to prevent cascading errors
  }
}

// ----------------------------------------------------------------------

export function isValidToken(accessToken) {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);

    if (!decoded || !('exp' in decoded)) {
      return false;
    }

    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error during token validation:', error);
    return false;
  }
}

// ----------------------------------------------------------------------

export function getAccessToken() {
  return localStorage.getItem(JWT_STORAGE_KEY);
}

// ----------------------------------------------------------------------

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

// ----------------------------------------------------------------------

export function hasPermission(user, requiredPermission) {
  if (!user || !user.permissions || !requiredPermission) {
    return false;
  }

  // Формат разрешения action:resource
  const [action, resource] = requiredPermission.split(':');
  
  // Проверяем есть ли у пользователя такое разрешение
  return user.permissions.some(permission => {
    const [userAction, userResource] = permission.split(':');
    return (userAction === action || userAction === '*') && 
           (userResource === resource || userResource === '*');
  });
}

// ----------------------------------------------------------------------

export function removeSession() {
  localStorage.removeItem(JWT_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  delete axios.defaults.headers.common.Authorization;
}

// ----------------------------------------------------------------------

export function tokenExpired(exp) {
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;
  const refreshThreshold = 5 * 60 * 1000; // 5 минут до истечения

  if (timeLeft < 0) {
    return true; // Токен просрочен
  }
  
  // Если токен почти истек, запускаем процесс обновления
  if (timeLeft < refreshThreshold) {
    refreshAccessToken();
    return 'refresh'; // Токен скоро истечет, нужно обновить
  }

  // Иначе устанавливаем таймер для обновления
  setTimeout(async () => {
    try {
      await refreshAccessToken();
    } catch (error) {
      console.error('Failed to refresh token:', error);
      removeSession();
      window.location.href = paths.auth.jwt.signIn;
    }
  }, timeLeft - refreshThreshold);
  
  return false; // Токен действителен
}

// ----------------------------------------------------------------------

export async function refreshAccessToken() {
  try {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    // Отправляем запрос на обновление токена
    const response = await axios.post('/api/auth/refresh-token', {
      refreshToken,
    });
    
    if (response.data.success && response.data.data.accessToken) {
      const { accessToken } = response.data.data;
      
      // Обновляем только accessToken в localStorage и заголовках
      localStorage.setItem(JWT_STORAGE_KEY, accessToken);
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      
      // Устанавливаем новый таймер для следующего обновления
      const decodedToken = jwtDecode(accessToken);
      if (decodedToken && 'exp' in decodedToken) {
        tokenExpired(decodedToken.exp);
      }
      
      return true;
    }
    
    throw new Error('Failed to refresh token');
  } catch (error) {
    console.error('Error refreshing token:', error);
    removeSession();
    window.location.href = paths.auth.jwt.signIn;
    return false;
  }
}

// ----------------------------------------------------------------------

export async function setSession(accessToken, refreshToken = null) {
  try {
    if (accessToken) {
      console.log(`Setting session tokens - Access token: ${accessToken.substring(0, 10)}...`);
      
      // Сохраняем access token
      localStorage.setItem(JWT_STORAGE_KEY, accessToken);
      
      // Если предоставлен refresh token, сохраняем его
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
      }

      // Устанавливаем заголовок авторизации
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      try {
        // Декодируем токен
        const decodedToken = jwtDecode(accessToken);
  
        // Проверяем наличие времени истечения
        if (decodedToken && 'exp' in decodedToken) {
          tokenExpired(decodedToken.exp);
        } else {
          console.warn('Token missing expiration, but proceeding anyway');
          // Продолжаем выполнение, даже если нет поля exp
          // Это обеспечивает совместимость с разными форматами токенов
        }
      } catch (tokenError) {
        console.warn('Error decoding token, but proceeding with session setup:', tokenError);
        // Не выбрасываем ошибку, чтобы не блокировать вход при изменении формата токена
      }
    } else {
      // Удаляем токены при выходе
      removeSession();
    }
    
    return true;
  } catch (error) {
    console.error('Error during set session:', error);
    // Даже если возникла ошибка, возвращаем true чтобы не блокировать вход
    return true;
  }
}
