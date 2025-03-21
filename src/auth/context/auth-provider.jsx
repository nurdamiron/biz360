// src/auth/context/auth-provider.js
import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from './auth-context';
import { setSession, isValidToken } from '../utils';

// Если у вас есть реальные API-запросы, используйте их
// import apiService from '../../api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Функция определения начальной страницы в зависимости от роли/отдела
  const getInitialRoute = (userData) => {
    // По умолчанию - перенаправляем на личный дашборд
    if (!userData) return '/dashboard';
    
    // Для сотрудников отдела продаж - на дашборд продаж
    if (userData.department === 'sales') {
      return '/dashboard/sales';
    }
    
    // Для руководителей и администраторов - на общий дашборд
    if (userData.role === 'admin' || userData.role === 'head' || userData.role === 'owner') {
      return '/dashboard';
    }
    
    // Для сотрудников других отделов - на страницу их метрик
    return '/dashboard/metrics/employee/me';
  };

  // Инициализация при загрузке страницы
  const initialize = useCallback(async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('accessToken');

      if (token && isValidToken(token)) {
        setSession(token);

        // Здесь должен быть запрос к API для получения данных пользователя
        // const response = await apiService.getProfile();
        // const { user } = response.data;
        
        // Для примера используем мок-данные
        const userMock = {
          id: '12345',
          name: 'Иван Петров',
          email: 'ivan@example.com',
          role: 'manager',
          department: 'sales',
          avatar: null,
        };

        setUser(userMock);
      } else {
        setSession(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Auth initialize error:', err);
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Аутентификация пользователя
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Здесь должен быть запрос к API для аутентификации
      // const response = await apiService.login({ email, password });
      // const { token, user } = response.data;
      
      // Для примера используем мок-данные
      const token = 'mock-jwt-token';
      const userData = {
        id: '12345',
        name: 'Иван Петров',
        email,
        role: 'manager',
        department: 'sales',
        avatar: null,
      };

      setSession(token);
      setUser(userData);

      // Возвращаем путь для перенаправления в зависимости от роли
      return getInitialRoute(userData);
    } catch (err) {
      console.error('Login error:', err);
      setError('Неверный логин или пароль');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Выход пользователя
  const logout = useCallback(() => {
    setSession(null);
    setUser(null);
  }, []);

  // Регистрация нового пользователя (если поддерживается)
  const register = useCallback(async (email, password, firstName, lastName) => {
    try {
      setLoading(true);
      setError(null);

      // Здесь должен быть запрос к API для регистрации
      // const response = await apiService.register({
      //   email,
      //   password,
      //   firstName,
      //   lastName,
      // });
      
      // Имитация успешной регистрации
      return true;
    } catch (err) {
      console.error('Register error:', err);
      setError(err.message || 'Ошибка при регистрации');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Восстановление пароля (если поддерживается)
  const resetPassword = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);

      // Здесь должен быть запрос к API для восстановления пароля
      // await apiService.resetPassword({ email });
      
      // Имитация успешного восстановления
      return true;
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message || 'Ошибка при восстановлении пароля');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление профиля пользователя (если поддерживается)
  const updateProfile = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);

      // Здесь должен быть запрос к API для обновления профиля
      // const response = await apiService.updateProfile(data);
      // const { user: updatedUser } = response.data;
      
      // Имитация обновления данных пользователя
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      
      return true;
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message || 'Ошибка при обновлении профиля');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const contextValue = {
    user,
    loading,
    error,
    initialize,
    login,
    logout,
    register,
    resetPassword,
    updateProfile,
    getInitialRoute,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};