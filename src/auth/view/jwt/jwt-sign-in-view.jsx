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
    } catch {
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
      console.log('Failed to decode token:', token);
      return false;
    }
  
    console.log('Decoded Token:', decoded);
  
    if (!decoded.exp) {
      console.log('Token does not contain "exp" field.');
      return false;
    }
  
    const isValid = (decoded.exp - 30) > Date.now() / 1000;
    console.log('Is Token Valid:', isValid, 'Current Time:', Date.now() / 1000, 'Expiry Time:', decoded.exp);
  
    return isValid;
  },
  

  async refreshToken() {
    try {
      const refresh = this.getRefreshToken();
      if (!refresh) throw new Error('No refresh token found');

      const response = await fetch('https://backend.ecotrend.kz/api/auth/login/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ refresh }),
        mode: 'cors'
      });

      if (!response.ok) {
        this.clearTokens();
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      this.setAccessToken(data.access);
      console.log('Access Token from Response:', data.access);

      return data.access;
    } catch (error) {
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
      
      const response = await fetch('https://biz360-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        mode: 'cors'
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }

      // Проверка токена
      const decodedAccess = tokenUtils.jwtDecode(data.access);
      console.log('Decoded Access Token:', decodedAccess);

      if (!decodedAccess || !decodedAccess.exp) {
        throw new Error('Invalid access token received from server');
      }

      const isValid = tokenUtils.isValidToken(data.access);
      console.log('Is Access Token Valid:', isValid);

      // Сохранение токенов
      console.log('💾 Saving tokens...');
      tokenUtils.setAccessToken(data.access);
      tokenUtils.setRefreshToken(data.refresh);

      return data;
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
      console.log('📝 Starting login process...');
      
      // Выполняем попытку авторизации
      await authService.signInWithPassword({
        email: data.email,
        password: data.password,
      });
  
      console.log('🔄 Checking employee session...');
      await checkEmployeeSession?.();

      // Получаем параметр returnTo из query, если он существует
      const department = data.department || 'sales'; // Получаем отдел пользователя
      let redirectPath;

      if (department === 'sales') {
        redirectPath = paths.dashboard.departmentRoutes.sales.employee('me');
      } else if (department === 'accounting') {
        redirectPath = paths.dashboard.departmentRoutes.accounting.employee('me');
      } else if (department === 'logistics') {
        redirectPath = paths.dashboard.departmentRoutes.logistics.employee('me');
      } else if (department === 'manufacture') {
        redirectPath = paths.dashboard.departmentRoutes.manufacture.employee('me');
      } else {
        // Запасной вариант
        redirectPath = paths.dashboard.sales.root;
      }
  
      console.log('Redirecting to:', paths.dashboard.root);
      router.push(redirectPath);
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