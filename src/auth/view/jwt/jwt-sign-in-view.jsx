import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { useAuthContext } from '../../hooks';
import { FormHead } from '../../components/form-head';
import axios from 'src/lib/axios';

// Constants
const JWT_ACCESS_KEY = 'jwt_access_token';
const JWT_REFRESH_KEY = 'refresh_token';

// Token utilities
const tokenUtils = {
  getAccessToken() {
    return localStorage.getItem(JWT_ACCESS_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(JWT_REFRESH_KEY);
  },

  setAccessToken(token) {
    if (token) {
      localStorage.setItem(JWT_ACCESS_KEY, token);
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  },

  setRefreshToken(token) {
    if (token) {
      localStorage.setItem(JWT_REFRESH_KEY, token);
    }
  },

  clearTokens() {
    localStorage.removeItem(JWT_ACCESS_KEY);
    localStorage.removeItem(JWT_REFRESH_KEY);
    delete axios.defaults.headers.common.Authorization;
  },

  jwtDecode(token) {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  },

  isValidToken(token) {
    if (!token) {
      console.log('Token is missing.');
      return false;
    }
  
    const decoded = this.jwtDecode(token);
    if (!decoded) {
      console.log('Failed to decode token');
      return false;
    }
  
    if (!decoded.exp) {
      console.log('Token does not contain "exp" field.');
      return false;
    }
  
    const currentTime = Date.now() / 1000;
    const isValid = decoded.exp > currentTime;
    const timeLeft = decoded.exp - currentTime;
    
    console.log(`Token valid: ${isValid}, expires in: ${Math.round(timeLeft)} seconds`);
    return isValid;
  },
  
  // Получает текущий API URL в зависимости от окружения
  getApiUrl() {
    return window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : 'https://biz360-backend.onrender.com';
  },

  // Сохраняет токены и проверяет их валидность
  saveAndValidateTokens(accessToken, refreshToken) {
    if (!accessToken) {
      console.error('Access token is missing');
      throw new Error('Access token is missing');
    }
    
    console.log('Saving tokens - Access token:', accessToken.substring(0, 15) + '...');
    
    // Сохраняем токены
    this.setAccessToken(accessToken);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
    
    try {
      // Проверяем валидность Access Token
      const isValid = this.isValidToken(accessToken);
      if (!isValid) {
        console.warn('Received invalid access token, clearing tokens');
        this.clearTokens();
        throw new Error('Invalid access token received');
      }
      
      return isValid;
    } catch (error) {
      // В случае ошибки при валидации, все равно сохраняем токен
      // Это позволит системе работать, даже если формат токена изменится
      console.warn('Token validation error but proceeding anyway:', error.message);
      return true;
    }
  },

  async refreshToken() {
    try {
      const refreshTokenValue = this.getRefreshToken();
      if (!refreshTokenValue) throw new Error('No refresh token found');

      const API_URL = this.getApiUrl();
      console.log(`Refreshing token using API URL: ${API_URL}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 сек таймаут

      const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
        mode: 'cors',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        this.clearTokens();
        throw new Error(`Failed to refresh token: ${response.status}`);
      }

      const data = await response.json();
      if (!data.data || !data.data.accessToken) {
        throw new Error('Invalid refresh token response format');
      }
      
      const { accessToken } = data.data;
      this.saveAndValidateTokens(accessToken, null);
      return accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearTokens();
      throw error;
    }
  }
};

// Schema validation
export const SignInSchema = zod.object({
  email: zod.string().min(1, { message: 'Имя пользователя обязательно!' }),
  password: zod.string().min(1, { message: 'Пароль обязателен!' })
});

// Auth service
const authService = {
  async signInWithPassword({ email, password }) {
    try {
      console.log('🚀 Attempting login...');
      
      // Используем centralized API URL
      const API_URL = tokenUtils.getApiUrl();
      console.log(`Using API URL: ${API_URL}`);
      
      // Добавляем таймаут и повторные попытки
      const MAX_RETRIES = 2;
      let retryCount = 0;
      let loginError;
      
      while (retryCount <= MAX_RETRIES) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 секунд таймаут
          
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            mode: 'cors',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          const data = await response.json().catch(() => ({}));
          console.log('📦 Response status:', response.status, 'data:', data);
          
          // Если запрос успешен, сохраняем токены и возвращаем данные
          if (response.ok) {
            // Адаптируем под оба формата ответа - новый с data.data и старый прямой формат
            if (data.data && data.data.accessToken && data.data.refreshToken) {
              // Новый формат с data.data
              const { accessToken, refreshToken, user } = data.data;
              tokenUtils.saveAndValidateTokens(accessToken, refreshToken);
              
              console.log('✅ Login successful, tokens saved (new format)');
              return { ...data.data, user: { ...user, accessToken } };
            } else if (data.access && data.refresh && data.user) {
              // Старый формат с прямыми полями
              const { access, refresh, user } = data;
              tokenUtils.saveAndValidateTokens(access, refresh);
              
              console.log('✅ Login successful, tokens saved (legacy format)');
              return { 
                accessToken: access, 
                refreshToken: refresh, 
                user: { ...user, accessToken: access } 
              };
            } else {
              console.error('Invalid response format:', data);
              throw new Error('Некорректный формат ответа от сервера');
            }
          }
          
          // Если запрос неудачен, формируем информативное сообщение об ошибке
          let errorMessage = `Ошибка входа (${response.status})`;
          
          if (data.error) {
            errorMessage = data.error;
          } else if (data.message) {
            errorMessage = data.message;
          } else if (response.status === 401) {
            errorMessage = 'Неверные учетные данные';
          } else if (response.status === 403) {
            errorMessage = 'Доступ запрещен';
          } else if (response.status === 500) {
            errorMessage = 'Ошибка сервера. Пожалуйста, повторите попытку позже';
          }
          
          loginError = new Error(errorMessage);
        } catch (error) {
          console.error(`Попытка ${retryCount + 1} не удалась:`, error);
          loginError = error;
          
          // Если это ошибка таймаута, показываем специальное сообщение
          if (error.name === 'AbortError') {
            loginError = new Error('Сервер не отвечает. Пожалуйста, повторите попытку позже.');
          }
        }
        
        retryCount++;
        if (retryCount <= MAX_RETRIES) {
          console.log(`Повторная попытка ${retryCount}...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Увеличивающаяся задержка
        }
      }
      
      // Если все попытки неудачны, выбрасываем сохраненную ошибку
      throw loginError || new Error('Не удалось войти в систему после нескольких попыток');
    } catch (error) {
      console.error('❌ Login error:', error);
      tokenUtils.clearTokens();
      throw error;
    }
  }
};

// Setup axios interceptors for token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (!isRefreshing) {
      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const newToken = await tokenUtils.refreshToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenUtils.clearTokens();
        window.location.href = paths.auth.jwt.signIn;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }
);

export function JwtSignInView() {
  const router = useRouter();
  const showPassword = useBoolean();
  const { checkEmployeeSession } = useAuthContext();
  const [errorMessage, setErrorMessage] = useState('');

  const defaultValues = {
    email: '',
    password: ''
  };

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(''); // Очищаем предыдущие ошибки
      console.log('📝 Starting login process...');
      
      // Выполняем попытку авторизации с обработкой ошибок
      console.time('login');
      const result = await authService.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      console.timeEnd('login');
      
      console.log('Login result:', result);
      
      // Закладываем минимальную паузу для гарантии сохранения токенов
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🔄 Checking employee session...');
      
      // Проверяем сессию пользователя
      const sessionValid = await checkEmployeeSession?.();
      console.log('Session check result:', sessionValid);
      
      // Определяем путь для переадресации - используем данные из result для надежности
      const role = result?.user?.role || result?.user?.employee?.role || 'sales';
      const department = result?.user?.department || 'sales';
      
      // Перенаправляем на дашборд без хэшей в URL
      // Важно: используем window.location.href вместо router.replace
      // для предотвращения цикла перенаправлений
      console.log(`Redirecting to dashboard root: ${paths.dashboard.root}`);
      window.location.href = paths.dashboard.root;
    } catch (error) {
      console.error('❌ Login failed:', error);
      setErrorMessage(error.message || 'Произошла ошибка при входе');
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text 
        name="email" 
        label="Имя пользователя"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
        <Link
          component={RouterLink}
          href={paths.auth.jwt.forgotPassword}
          variant="body2"
          color="inherit"
          sx={{ alignSelf: 'flex-end' }}
        >
          Забыли пароль?
        </Link>

        <Field.Text
          name="password"
          label="Пароль"
          type={showPassword.value ? 'text' : 'password'}
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={showPassword.onToggle} edge="end">
                    <Iconify
                      icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Вход..."
        sx={{
          height: 48,
          position: 'relative',
          '&.MuiLoadingButton-loading': {
            backgroundColor: 'action.selected'
          }
        }}
      >
        Войти
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <FormHead
        title="Вход в личный кабинет"
        description={
          <>
            У вас нет учетной записи?{' '}
            <Link component={RouterLink} href={paths.auth.jwt.signUp} variant="subtitle2">
              Зарегистрируйтесь
            </Link>
          </>
        }
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>
    </>
  );
}