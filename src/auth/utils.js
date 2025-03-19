// src/auth/utils.js
/**
 * Утилиты для проверки прав доступа на основе ролей и отделов
 */

// Проверка доступа к отделу
// Проверка доступа к отделу - исправленная версия
export function hasAccessToDepartment(user, targetDepartment) {
    console.log('hasAccessToDepartment check:', { user, targetDepartment });
    
    if (!user) {
      return false;
    }
    
    const { role, department } = user.employee || {};
    
    // Администраторы и владельцы имеют доступ ко всем отделам
    if (role === 'owner' || role === 'admin') {
      return true;
    }
    
    // Руководители имеют доступ к своему отделу
    if (role === 'head') {
      return department === targetDepartment;
    }
    
    // Для отдела продаж дополнительные права (если нужно)
    if (department === 'sales') {
      // Сотрудники продаж могут видеть страницы продаж, заказов и т.д.
      return true;
    }
    
    // Остальные сотрудники имеют доступ только к своему отделу
    return department === targetDepartment;
  }
  
  // Проверка доступа на основе роли
  export function hasAccessByRole(user, allowedRoles) {
    if (!user || !user.employee || !user.employee.role) {
      return false;
    }
    
    return allowedRoles.includes(user.employee.role);
  }
  
  // Проверка, является ли пользователь руководителем
  export function isDepartmentHead(user) {
    return user?.employee?.role === 'head';
  }
  
  // Проверка, является ли пользователь администратором или владельцем
  export function isAdmin(user) {
    return user?.employee?.role === 'owner' || user?.employee?.role === 'admin';
  }
  
  // Проверка, является ли пользователь менеджером
  export function isManager(user) {
    return user?.employee?.role === 'manager';
  }
  
  // Получение отдела пользователя
  export function getUserDepartment(user) {
    return user?.employee?.department || null;
  }
  
  // Получение роли пользователя
  export function getUserRole(user) {
    return user?.employee?.role || null;
  }
  
  // Проверка наличия доступа пользователя к функционалу
  export function canAccessFeature(user, feature) {
    if (!user || !user.employee) {
      return false;
    }
    
    // Администраторы могут все
    if (isAdmin(user)) {
      return true;
    }
    
    const { role, department } = user.employee;
    
    // Доступ к различным функциям системы в зависимости от отдела и роли
    const accessMap = {
      // Для продаж
      sales: {
        head: ['dashboard', 'metrics', 'employees', 'products', 'orders', 'invoices'],
        manager: ['metrics', 'products', 'orders', 'invoices'],
        employee: ['metrics', 'products', 'orders']
      },
      // Для бухгалтерии
      accounting: {
        head: ['dashboard', 'metrics', 'employees', 'invoices', 'finances'],
        manager: ['metrics', 'invoices', 'finances'],
        employee: ['metrics', 'invoices']
      },
      // Для логистики
      logistics: {
        head: ['dashboard', 'metrics', 'employees', 'orders', 'deliveries'],
        manager: ['metrics', 'orders', 'deliveries'],
        employee: ['metrics', 'orders', 'deliveries']
      },
      // Для производства
      manufacture: {
        head: ['dashboard', 'metrics', 'employees', 'products', 'production'],
        manager: ['metrics', 'products', 'production'],
        employee: ['metrics', 'products', 'production']
      }
    };
    
    // Проверка доступа
    return accessMap[department]?.[role]?.includes(feature) || false;
  }
  
  // Преобразование кода отдела в название на русском
  export function departmentToRussian(departmentCode) {
    const departments = {
      'sales': 'Отдел продаж',
      'accounting': 'Бухгалтерия',
      'logistics': 'Логистика',
      'manufacture': 'Производство'
    };
    
    return departments[departmentCode] || departmentCode;
  }
  
  // Преобразование кода роли в название на русском
  export function roleToRussian(roleCode) {
    const roles = {
      'owner': 'Владелец',
      'admin': 'Администратор',
      'head': 'Руководитель',
      'manager': 'Менеджер',
      'employee': 'Сотрудник'
    };
    
    return roles[roleCode] || roleCode;
  }