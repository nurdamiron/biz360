
import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';
import axios, { endpoints } from 'src/lib/axios';
import { login, logout, register, refreshToken as refreshTokenAction } from './action';
import { JWT_STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken, getAccessToken, getRefreshToken } from './utils';

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({ 
    employee: null, 
    loading: true,
    error: null
  });

  // Функция для проверки и обновления сессии пользователя
  const checkEmployeeSession = useCallback(async () => {
    try {
      setState({ loading: true });
      const accessToken = getAccessToken();
      const refreshTokenValue = getRefreshToken();

      console.log('Checking session, access token exists:', !!accessToken);
      
      // Если есть действительный токен доступа
      if (accessToken && isValidToken(accessToken)) {
        console.log('Access token is valid, fetching user data');
        
        // Устанавливаем токен в сессию
        setSession(accessToken, refreshTokenValue);

        try {
          // Устанавливаем таймаут для запроса
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 секунд таймаут
          
          try {
            // Получаем данные текущего пользователя с контролем таймаута
            const response = await axios.get(endpoints.auth.me, {
              signal: controller.signal,
              headers: {
                'Cache-Control': 'no-cache',
              }
            });
            
            // Выводим ответ для отладки
            console.log('ME endpoint response:', response.data);
            
            // Поддерживаем оба формата ответа API
            if (response.data.success && response.data.data && response.data.data.user) {
              // Формат 1: { success: true, data: { user: {...} } }
              const userData = response.data.data.user;
              
              setState({ 
                employee: { 
                  ...userData,
                  accessToken 
                }, 
                loading: false,
                error: null
              });
              
              console.log('User session loaded successfully (format 1)');
              return true;
            } else if (response.data.user) {
              // Формат 2: { user: {...} }
              const userData = response.data.user;
              
              setState({ 
                employee: { 
                  ...userData,
                  accessToken 
                }, 
                loading: false,
                error: null
              });
              
              console.log('User session loaded successfully (format 2)');
              return true;
            } else if (response.data.id) {
              // Формат 3: Сам пользователь в ответе
              const userData = response.data;
              
              setState({ 
                employee: { 
                  ...userData,
                  accessToken 
                }, 
                loading: false,
                error: null
              });
              
              console.log('User session loaded successfully (format 3)');
              return true;
            } else {
              console.error('Invalid user data format from API:', response.data);
              throw new Error('Invalid user data format from API');
            }
          } finally {
            clearTimeout(timeoutId);
          }
        } catch (fetchError) {
          console.error('Error fetching user data:', fetchError);
          
          // Если ошибка таймаута или сетевая, пробуем обновить токен
          if (fetchError.name === 'AbortError' || fetchError.code === 'ECONNABORTED') {
            console.log('Request timed out, trying to refresh token');
            throw new Error('Session validation timed out');
          }
          
          throw fetchError;
        }
      } 
      // Если есть refresh token, но access token истек или неверный
      else if (refreshTokenValue) {
        console.log('Access token invalid or missing, trying to refresh');
        
        try {
          // Пытаемся обновить токен
          const newAccessToken = await refreshTokenAction(refreshTokenValue);
          
          // Если успешно, повторно вызываем проверку сессии
          if (newAccessToken) {
            console.log('Token refreshed successfully, rechecking session');
            return checkEmployeeSession();
          }
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          setState({ 
            employee: null, 
            loading: false, 
            error: 'Session expired. Please login again.' 
          });
        }
      } 
      // Если нет действительных токенов
      else {
        console.log('No valid tokens found');
        setState({ employee: null, loading: false, error: null });
      }
    } catch (error) {
      console.error('Error during session check:', error);
      setState({ 
        employee: null, 
        loading: false,
        error: error.message || 'Authentication failed' 
      });
      return false;
    }
    return true;
  }, [setState]);

  // Функция для входа пользователя
  const handleLogin = useCallback(async (credentials) => {
    try {
      setState({ loading: true, error: null });
      
      // Вызываем функцию входа из action.js
      const userData = await login(credentials);
      
      // Обновляем состояние с данными пользователя
      setState({ 
        employee: userData, 
        loading: false,
        error: null
      });
      
      return userData;
    } catch (error) {
      setState({ 
        loading: false, 
        error: error.message || 'Login failed'
      });
      throw error;
    }
  }, [setState]);

  // Функция для регистрации пользователя
  const handleRegister = useCallback(async (userData) => {
    try {
      setState({ loading: true, error: null });
      
      // Вызываем функцию регистрации из action.js
      const result = await register(userData);
      
      setState({ loading: false, error: null });
      return result;
    } catch (error) {
      setState({
        loading: false,
        error: error.message || 'Registration failed'
      });
      throw error;
    }
  }, [setState]);

  // Функция для выхода пользователя
  const handleLogout = useCallback(async () => {
    try {
      setState({ loading: true, error: null });
      
      // Вызываем функцию выхода из action.js
      await logout();
      
      // Очищаем состояние пользователя
      setState({ 
        employee: null, 
        loading: false,
        error: null 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Даже при ошибке очищаем состояние на клиенте
      setState({ 
        employee: null, 
        loading: false,
        error: error.message || 'Logout failed, but session cleared locally' 
      });
    }
  }, [setState]);

  // Инициализация: проверяем сессию при загрузке компонента
  useEffect(() => {
    checkEmployeeSession();
  }, [checkEmployeeSession]);

  // ----------------------------------------------------------------------

  // Определение статуса аутентификации
  const checkAuthenticated = state.employee ? 'authenticated' : 'unauthenticated';
  const status = state.loading ? 'loading' : checkAuthenticated;

  // Создаем значение контекста с мемоизацией для оптимизации
  const memoizedValue = useMemo(
    () => ({
      employee: state.employee,
      checkEmployeeSession,
      login: handleLogin,
      logout: handleLogout,
      register: handleRegister,
      loading: status === 'loading',
      error: state.error,
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [
      checkEmployeeSession, 
      handleLogin, 
      handleLogout, 
      handleRegister, 
      state.employee, 
      state.error, 
      status
    ]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
