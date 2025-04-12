// src/auth/context/auth-context.jsx
import { createContext } from 'react';

// ----------------------------------------------------------------------

/**
 * AuthContext предоставляет данные аутентификации всему приложению
 * 
 * Содержит:
 * - authenticated: флаг, указывающий, аутентифицирован ли пользователь
 * - unauthenticated: флаг, указывающий, что пользователь не аутентифицирован
 * - loading: флаг, указывающий, происходит ли загрузка данных аутентификации
 * - error: текст ошибки, если возникла проблема при аутентификации
 * - employee: данные сотрудника (пользователя)
 * - login: функция для входа в систему (email, password)
 * - register: функция для регистрации (email, password, name, company_name, phone, role)
 * - logout: функция для выхода из системы
 * - checkEmployeeSession: функция для проверки и обновления сессии пользователя
 */
export const AuthContext = createContext({
  authenticated: false,
  unauthenticated: true,
  loading: true,
  error: null,
  employee: null,
  login: () => Promise.resolve(),
  register: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  checkEmployeeSession: () => Promise.resolve(),
});