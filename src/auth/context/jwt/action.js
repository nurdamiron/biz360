import axios, { endpoints } from 'src/lib/axios';
import { setSession } from './utils';

/** **************************************
 * Login (Sign in)
 *************************************** */

// ----------------------------------------------------------------------

export const login = async ({ email, password }) => {
  try {
    console.time('login-request');
    const params = { email, password };

    // Устанавливаем таймаут для запроса
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 секунд таймаут
    
    try {
      // Делаем запрос с сигналом для возможности отмены
      const response = await axios.post(endpoints.auth.login, params, {
        signal: controller.signal,
        // Устанавливаем хедеры для более предсказуемого ответа
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.timeEnd('login-request');
      console.log('Login response data:', response.data);
      
      // Создаем временную переменную для хранения обработанного ответа
      let processedData = null;
      
      // Проверяем наличие данных в ответе - поддерживаем оба возможных формата
      // 1. Формат: { success: true, data: { accessToken, refreshToken, user } }
      // 2. Формат: { access, refresh, user }
      
      if (response.data.success && response.data.data) {
        // Формат 1 (новый формат)
        const { accessToken, refreshToken, user } = response.data.data;
        
        if (!accessToken || !refreshToken || !user) {
          throw new Error('Missing required data in response');
        }
        
        // Сохраняем токены
        await setSession(accessToken, refreshToken);
        
        // Сохраняем для возврата
        processedData = { 
          ...user, 
          accessToken,
          department: user.department || user.employee?.department || 'sales'
        };
      } 
      else if (response.data.access && response.data.refresh && response.data.user) {
        // Формат 2 (старый формат)
        const { access, refresh, user } = response.data;
        
        // Сохраняем токены
        await setSession(access, refresh);
        
        // Сохраняем для возврата
        processedData = { 
          ...user, 
          accessToken: access,
          department: user.department || user.employee?.department || 'sales'
        };
      }
      else {
        console.error('Unrecognized API response format:', response.data);
        throw new Error('Некорректный формат ответа от сервера');
      }
      
      // Возвращаем данные пользователя для обновления состояния
      console.log('Processed login data:', processedData);
      return processedData;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('Error during login:', error);
    
    // Преобразуем ошибки в более информативные для пользователя
    if (error.name === 'AbortError') {
      throw new Error('Сервер не отвечает. Пожалуйста, повторите попытку позже.');
    } else if (error.response) {
      // Обрабатываем ошибки от сервера
      if (error.response.status === 401) {
        throw new Error('Неверные учетные данные');
      } else if (error.response.status === 403) {
        throw new Error('Доступ запрещен');
      } else if (error.response.status === 500) {
        throw new Error('Ошибка сервера. Пожалуйста, повторите попытку позже');
      }
      
      // Пытаемся извлечь сообщение об ошибке из ответа
      const errorMessage = error.response.data?.message 
        || error.response.data?.error 
        || `Ошибка: ${error.response.status}`;
      throw new Error(errorMessage);
    }
    
    throw error;
  }
};

/** **************************************
 * Register (Sign up)
 *************************************** */

// ----------------------------------------------------------------------

export const register = async ({ email, password, name, company_name, phone, role }) => {
  try {
    const params = {
      email,
      password,
      name,
      company_name,
      phone,
      role
    };

    const response = await axios.post(endpoints.auth.register, params);

    // Проверка на успешность согласно документации
    if (!response.data.success) {
      throw new Error(response.data.message || 'Registration failed');
    }

    return response.data.data; // Возвращаем данные о пользователе и токене верификации
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

/** **************************************
 * Logout (Sign out)
 *************************************** */

// ----------------------------------------------------------------------

export const logout = async () => {
  try {
    // Очищаем токены на клиенте
    await setSession(null);
    
    // Опционально: отправка запроса на сервер для инвалидации токена
    try {
      await axios.post(endpoints.auth.logout);
    } catch (logoutError) {
      console.error('Error during server logout, but session cleared locally:', logoutError);
      // Продолжаем выход даже при ошибке серверного логаута
    }
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

/** **************************************
 * Refresh Token
 *************************************** */

// ----------------------------------------------------------------------

export const refreshToken = async (refreshTokenValue) => {
  try {
    const response = await axios.post(endpoints.auth.refreshToken, {
      refreshToken: refreshTokenValue
    });

    // Проверка на успешность согласно документации
    if (!response.data.success) {
      throw new Error(response.data.message || 'Token refresh failed');
    }

    const { accessToken } = response.data.data;

    if (!accessToken) {
      throw new Error('Access token not found in refresh response');
    }

    // Обновляем только access token, refresh token остается прежним
    await setSession(accessToken);

    return accessToken;
  } catch (error) {
    console.error('Error during token refresh:', error);
    throw error;
  }
};

// Export alias for signOut (to maintain compatibility)
export const signOut = logout;
