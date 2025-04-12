// src/auth/RoleDepartmentGuard.js
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import { useAuthContext } from './hooks';
import { RoleBasedGuard } from './guard/role-based-guard';
import { hasPermission as checkPermission } from './context/jwt/utils';

/**
 * Расширенный Guard для проверки роли и департамента
 * Комбинирует перенаправление на страницу входа при отсутствии авторизации
 * и проверку прав доступа через RoleBasedGuard
 */
export default function RoleDepartmentGuard({ 
  children, 
  requiredRole, 
  requiredPermission,
  requiredDepartment,
  hasPermission, // Для обратной совместимости
  accessDeniedPath,
  hasContent = true,
  sx
}) {
  const { employee, authenticated, loading } = useAuthContext();
  const navigate = useNavigate();
  const params = useParams();
  const [checked, setChecked] = useState(false);

  // Проверка с помощью пользовательской функции hasPermission (для обратной совместимости)
  const checkCustomPermission = () => {
    if (!hasPermission) return true;
    
    // Добавляем параметры к объекту пользователя для проверки прав
    const userWithParams = {
      employee,
      params,
    };

    try {
      // Проверяем права с помощью предоставленной функции или по умолчанию true в режиме разработки
      return process.env.NODE_ENV === 'development' || hasPermission(userWithParams);
    } catch (error) {
      console.error('Error checking custom permissions:', error);
      // В случае ошибки, разрешаем доступ в режиме разработки
      return process.env.NODE_ENV === 'development';
    }
  };

  useEffect(() => {
    // Ничего не делаем пока загружаемся
    if (loading) {
      return;
    }

    // Если не аутентифицирован, перенаправляем на страницу входа
    if (!authenticated) {
      navigate(paths.auth.jwt.signIn, { replace: true });
      return;
    }

    // Если передана пользовательская функция проверки, используем её
    if (hasPermission) {
      const hasAccess = checkCustomPermission();
      
      if (!hasAccess) {
        // Перенаправляем на страницу с отказом в доступе
        navigate(accessDeniedPath || paths.dashboard.metrics.employee('me'), { replace: true });
      } else {
        setChecked(true);
      }
    } else {
      // Иначе просто помечаем проверку как выполненную
      setChecked(true);
    }
  }, [loading, authenticated, employee, params, hasPermission, navigate, accessDeniedPath]);

  // Не рендерим ничего, пока не завершена проверка
  if (loading || !checked) {
    return null;
  }

  // Если передана пользовательская функция проверки и проверка пройдена,
  // возвращаем детей напрямую
  if (hasPermission) {
    return children;
  }

  // Иначе используем стандартный RoleBasedGuard для проверки ролей и разрешений
  return (
    <RoleBasedGuard
      currentUser={employee}
      requiredRole={requiredRole}
      requiredPermission={requiredPermission}
      requiredDepartment={requiredDepartment}
      hasContent={hasContent}
      sx={sx}
    >
      {children}
    </RoleBasedGuard>
  );
}