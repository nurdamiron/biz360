// src/auth/context/auth-context.jsx
import { createContext } from 'react';

// ----------------------------------------------------------------------

/**
 * AuthContext предоставляет данные аутентификации всему приложению
 * 
 * Содержит:
 * - authenticated: флаг, указывающий, аутентифицирован ли пользователь
 * - loading: флаг, указывающий, происходит ли загрузка данных аутентификации
 * - employee: данные сотрудника (пользователя)
 * - login: функция для входа в систему
 * - logout: функция для выхода из системы
 * - initialize: функция для инициализации контекста аутентификации
 * - refreshUserData: функция для обновления данных пользователя
 */
export const AuthContext = createContext({
  authenticated: false,
  loading: true,
  employee: null,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  initialize: () => Promise.resolve(),
  refreshUserData: () => Promise.resolve(),
  checkEmployeeSession: () => Promise.resolve(),
});