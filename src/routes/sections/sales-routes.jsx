// src/routes/sections/sales-routes.jsx

import { lazy } from 'react';
import { Loadable } from 'src/components/loadable/index.jsx';
import { AuthGuard } from 'src/auth/guard';
import RoleDepartmentGuard from 'src/auth/RoleDepartmentGuard';
import { DashboardLayout } from 'src/layouts/dashboard';
import { Navigate, Outlet } from 'react-router-dom';

// ----------------------------------------------------------------------

// Загрузка страниц отдела продаж с использованием ленивой загрузки
const SalesEmployeeDashboardPage = Loadable(
  lazy(() => import('src/pages/sales/sales-employee-dashboard'))
);

const SalesClientsPage = Loadable(
  lazy(() => import('src/pages/sales/sales-clients'))
);

const SalesClientDetailPage = Loadable(
  lazy(() => import('src/pages/sales/sales-client-detail'))
);

const SalesDevelopmentPage = Loadable(
  lazy(() => import('src/pages/sales/sales-development'))
);

const SalesBonusesPage = Loadable(
  lazy(() => import('src/pages/sales/sales-bonuses'))
);

// Страница для распределения лидов
const SalesLeadsDistributionPage = Loadable(
  lazy(() => import('src/pages/sales/sales-leads-distribution'))
);

// Страница для работы с лидами
const SalesLeadsPage = Loadable(
  lazy(() => import('src/pages/sales/sales-leads'))
);

// ----------------------------------------------------------------------

// Функция для проверки прав доступа к разделам отдела продаж
const hasSalesAccess = (user) => {
  // Сотрудники с доступом:
  // 1. Администраторы и владельцы
  if (user?.role === 'owner' || user?.role === 'admin') {
    return true;
  }
  
  // 2. Руководитель отдела продаж
  if (user?.role === 'head' && user?.department === 'sales') {
    return true;
  }
  
  // 3. Сотрудники отдела продаж
  if (user?.department === 'sales') {
    return true;
  }
  
  return false;
};

// ----------------------------------------------------------------------

export const salesRoutes = [
  // Редирект с корневого пути /dashboard на /dashboard/sales для сотрудников отдела продаж
  {
    path: '',
    element: (
      <AuthGuard>
        <RoleDepartmentGuard 
          hasPermission={(user) => user?.department === 'sales' && user?.role !== 'admin' && user?.role !== 'head'}
        >
          <Navigate to="/dashboard/sales" replace />
        </RoleDepartmentGuard>
      </AuthGuard>
    ),
  },
  // Основные маршруты отдела продаж
  {
    path: 'sales',
    element: (
      <AuthGuard>
        <RoleDepartmentGuard hasPermission={hasSalesAccess}>
          <DashboardLayout>
            <Outlet />
          </DashboardLayout>
        </RoleDepartmentGuard>
      </AuthGuard>
    ),
    children: [
      { element: <SalesEmployeeDashboardPage />, index: true },
      { path: 'clients', element: <SalesClientsPage /> },
      { path: 'client/:id', element: <SalesClientDetailPage /> },
      { path: 'development', element: <SalesDevelopmentPage /> },
      { path: 'bonuses', element: <SalesBonusesPage /> },
      { path: 'leads', element: <SalesLeadsPage /> },
      { path: 'leads-distribution', element: <SalesLeadsDistributionPage /> },
      
      // Новый маршрут для персонализированного дашборда сотрудника
      { 
        path: 'employee/:id', 
        element: <SalesEmployeeDashboardPage /> 
      }
    ]
  }
];