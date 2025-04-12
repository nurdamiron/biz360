// src/auth/guard/role-based-guard.jsx 

import { m } from 'framer-motion';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { ForbiddenIllustration } from 'src/assets/illustrations';
import { varBounce, MotionContainer } from 'src/components/animate';
import { hasPermission } from '../context/jwt/utils';

// ----------------------------------------------------------------------

/**
 * Иерархия ролей согласно документации:
 * 
 * 1. Company Level Roles:
 *    - Owner (высший уровень доступа)
 *    - Admin (администрирование на уровне компании)
 * 
 * 2. Department Level Roles:
 *    - Head (руководитель отдела)
 *    - Manager (менеджер с ограниченными возможностями управления)
 *    - Employee (базовый доступ к ресурсам отдела)
 */
const ROLE_HIERARCHY = {
  // Компанейские роли
  owner: 5,
  admin: 4,
  // Роли отделов
  head: 3,
  manager: 2,
  employee: 1
};

/**
 * Проверка, имеет ли роль пользователя достаточные права для доступа
 */
function checkRoleAccess(userRole, requiredRole) {
  // Если роли не определены, запрещаем доступ
  if (!userRole || !requiredRole) return false;
  
  // Получаем численное значение для сравнения
  const userRoleValue = ROLE_HIERARCHY[userRole.toLowerCase()] || 0;
  const requiredRoleValue = ROLE_HIERARCHY[requiredRole.toLowerCase()] || 0;
  
  // Сравниваем уровни ролей
  return userRoleValue >= requiredRoleValue;
}

/**
 * Проверка, имеет ли пользователь доступ на основе требуемого отдела
 */
function checkDepartmentAccess(user, requiredDepartment) {
  // Если отдел не указан, разрешаем доступ
  if (!requiredDepartment) return true;
  
  // owner и admin имеют доступ ко всем отделам
  if (user.role === 'owner' || user.role === 'admin') return true;
  
  // Другие роли имеют доступ только к своему отделу
  return user.department_id === requiredDepartment;
}

/**
 * Guard компонент, проверяющий права пользователя на основе ролей и разрешений
 */
export function RoleBasedGuard({ 
  sx, 
  children, 
  hasContent = true, 
  currentUser, 
  requiredRole,                  // Требуемая роль (owner, admin, head, manager, employee)
  requiredPermission,            // Требуемое разрешение в формате action:resource
  requiredDepartment,            // Требуемый отдел (ID отдела)
  acceptRoles = []               // Массив допустимых ролей (для обратной совместимости)
}) {
  // Проверка доступа
  let hasAccess = true;
  
  // Если пользователь не авторизован, запрещаем доступ
  if (!currentUser) {
    hasAccess = false;
  } 
  // Проверка на основе массива ролей (для обратной совместимости)
  else if (acceptRoles.length > 0 && !acceptRoles.includes(currentUser.role)) {
    hasAccess = false;
  }
  // Проверка на основе требуемой роли
  else if (requiredRole && !checkRoleAccess(currentUser.role, requiredRole)) {
    hasAccess = false;
  }
  // Проверка на основе требуемого разрешения
  else if (requiredPermission && !hasPermission(currentUser, requiredPermission)) {
    hasAccess = false;
  }
  // Проверка на основе требуемого отдела
  else if (requiredDepartment && !checkDepartmentAccess(currentUser, requiredDepartment)) {
    hasAccess = false;
  }

  // Если у пользователя нет доступа, показываем сообщение об ошибке
  if (!hasAccess) {
    return hasContent ? (
      <Container
        component={MotionContainer}
        sx={[{ textAlign: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
      >
        <m.div variants={varBounce('in')}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Permission denied
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <Typography sx={{ color: 'text.secondary' }}>
            You do not have permission to access this page.
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <ForbiddenIllustration sx={{ my: { xs: 5, sm: 10 } }} />
        </m.div>
      </Container>
    ) : null;
  }

  // Пользователь имеет доступ, отображаем содержимое
  return <>{children}</>;
}
