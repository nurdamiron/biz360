// src/auth/hooks/use-auth.js
import { useAuthContext } from './use-auth-context';

export function useAuth() {
  const context = useAuthContext();

  // Возвращаем стабильный объект для предотвращения лишних перерендеров
  return {
    user: context.employee,
    employee: context.employee, // Добавляем employee для совместимости
    isAuthenticated: context.authenticated,
    isLoading: context.loading,
    login: context.login,
    logout: context.logout,
    checkEmployeeSession: context.checkEmployeeSession,
    refreshUserData: context.refreshUserData
  };
}