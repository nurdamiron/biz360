// src/routes/sections/sales-routes.jsx
import { lazy } from 'react';
import { Loadable } from 'src/components/loadable/index.jsx';
import { AuthGuard } from 'src/auth/guard';
import RoleDepartmentGuard from 'src/auth/RoleDepartmentGuard';
import { DashboardLayout } from 'src/layouts/dashboard';

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

// ----------------------------------------------------------------------

// Функция для проверки прав доступа к разделам отдела продаж
const hasSalesAccess = (user) => {
  // Сотрудники с доступом:
  // 1. Администраторы и владельцы
  if (user?.employee?.role === 'owner' || user?.employee?.role === 'admin') {
    return true;
  }
  
  // 2. Руководитель отдела продаж
  if (user?.employee?.role === 'head' && user?.employee?.department === 'sales') {
    return true;
  }
  
  // 3. Сотрудники отдела продаж
  if (user?.employee?.department === 'sales') {
    return true;
  }
  
  return false;
};

// ----------------------------------------------------------------------

export const salesRoutes = [
  {
    path: 'sales',
    element: (
      <AuthGuard>
        <RoleDepartmentGuard hasPermission={hasSalesAccess}>
          <DashboardLayout>
            <SalesEmployeeDashboardPage />
          </DashboardLayout>
        </RoleDepartmentGuard>
      </AuthGuard>
    ),
    children: [
      { element: <SalesEmployeeDashboardPage />, index: true },
      { path: 'clients', element: <SalesClientsPage /> },
      { path: 'client/:id', element: <SalesClientDetailPage /> },
      { path: 'development', element: <SalesDevelopmentPage /> },
      { path: 'bonuses', element: <SalesBonusesPage /> }
    ]
  }
];