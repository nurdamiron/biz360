// src/auth/context/auth-provider.jsx 

import { useReducer, useCallback, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './auth-context';

// Получаем базовый URL из переменных окружения
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://biz360-backend.onrender.com';

const initialState = {
  authenticated: false,
  employee: null,
  loading: true, // Состояние загрузки
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'INITIAL': 
      return {
        ...action.payload,
        loading: false,
      };
    case 'LOGIN':
      return {
        authenticated: true,
        employee: action.payload,
        loading: false,
      };
    case 'LOGOUT':
      return {
        authenticated: false,
        employee: null,
        loading: false,
      };
    default:
      return state;
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Инициализация - проверка авторизации при загрузке
  const initialize = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('JWT_ACCESS_KEY');
      
      if (accessToken) {
        // Настраиваем axios для всех последующих запросов
        axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        
        // Получаем данные пользователя
        const response = await axios.get(`${SERVER_URL}/api/auth/me`);
        console.log('User data loaded:', response.data);
        
        // Обновляем состояние
        dispatch({
          type: 'INITIAL',
          payload: {
            authenticated: true,
            employee: response.data,
          },
        });
      } else {
        dispatch({
          type: 'INITIAL',
          payload: {
            authenticated: false,
            employee: null,
          },
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      
      // В случае ошибки (например, срок действия токена истек)
      localStorage.removeItem('JWT_ACCESS_KEY');
      delete axios.defaults.headers.common.Authorization;
      
      dispatch({
        type: 'INITIAL',
        payload: {
          authenticated: false,
          employee: null,
        },
      });
    }
  }, []);

  // Вызываем инициализацию при загрузке приложения
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Настраиваем базовый URL для axios
  useEffect(() => {
    axios.defaults.baseURL = SERVER_URL;
  }, []);

  // Функция входа
  const login = useCallback(async (email, password) => {
    try {
      const response = await axios.post(`${SERVER_URL}/api/auth/login`, {
        email,
        password,
      });
  
      console.log('Login API response:', response.data);
      
      // Важно! Убедитесь, что вы сохраняете правильную структуру данных
      const { access, user } = response.data;
      
      localStorage.setItem('JWT_ACCESS_KEY', access);
      axios.defaults.headers.common.Authorization = `Bearer ${access}`;
      
      // Передаем весь объект user как есть, не модифицируя его структуру
      dispatch({
        type: 'LOGIN',
        payload: user,
      });
  
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  // Функция выхода
  const logout = useCallback(async () => {
    try {
      // Только если пользователь авторизован, отправляем запрос на выход
      if (state.authenticated) {
        await axios.post(`${SERVER_URL}/api/auth/logout`);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Всегда удаляем локальные данные и обновляем состояние
      localStorage.removeItem('JWT_ACCESS_KEY');
      delete axios.defaults.headers.common.Authorization;
      dispatch({ type: 'LOGOUT' });
    }
  }, [state.authenticated]);

  // Функция обновления данных пользователя
  const refreshUserData = useCallback(async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/auth/me`);
      
      dispatch({
        type: 'LOGIN',
        payload: response.data,
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return null;
    }
  }, []);

  // Проверка сессии сотрудника - алиас для initialize
  const checkEmployeeSession = useCallback(async () => {
    try {
      await initialize();
      return { success: true };
    } catch (error) {
      console.error('Session check error:', error);
      return { success: false, error: error.message || 'Ошибка проверки сессии' };
    }
  }, [initialize]);

  // Формируем значение контекста
  const value = {
    authenticated: state.authenticated,
    employee: state.employee,
    loading: state.loading,
    login,
    logout,
    initialize,
    refreshUserData,
    checkEmployeeSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}