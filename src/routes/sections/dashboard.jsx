// src/routes/sections/dashboard.jsx
import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AccountLayout } from 'src/sections/account/account-layout';

import { AuthGuard } from 'src/auth/guard';

import { usePathname } from '../hooks';

import RoleDepartmentGuard from 'src/auth/RoleDepartmentGuard';
import { hasAccessToDepartment, hasAccessByRole, isAdmin, isDepartmentHead } from 'src/auth/utils';

import { Navigate } from 'react-router-dom';
// ----------------------------------------------------------------------
const EmployeeMetricsPage = lazy(() => import('src/pages/employee-metrics'));
const DepartmentMetricsPage = lazy(() => import('src/pages/department-metrics'));
const NotificationsPage = lazy(() => import('src/pages/notifications'));

// Overview
const IndexPage = lazy(() => import('src/pages/dashboard'));
const OverviewEcommercePage = lazy(() => import('src/pages/dashboard/ecommerce'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
const OverviewBankingPage = lazy(() => import('src/pages/dashboard/banking'));
const OverviewBookingPage = lazy(() => import('src/pages/dashboard/booking'));
const OverviewFilePage = lazy(() => import('src/pages/dashboard/file'));
const OverviewCoursePage = lazy(() => import('src/pages/dashboard/course'));
// Product
const ProductDetailsPage = lazy(() => import('src/pages/dashboard/product/details'));
const ProductListPage = lazy(() => import('src/pages/dashboard/product/list'));
const ProductCreatePage = lazy(() => import('src/pages/dashboard/product/new'));
const ProductEditPage = lazy(() => import('src/pages/dashboard/product/edit'));
// Order
const OrderCreatePage = lazy(() => import('src/pages/dashboard/order/new'));
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details'));
const OrderEditPage = lazy(() => import('src/pages/dashboard/order/edit'));
const OrderListPage = lazy(() => import('src/pages/dashboard/order/list'));

// Invoice
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list'));
const InvoiceDetailsPage = lazy(() => import('src/pages/dashboard/invoice/details'));
const InvoiceCreatePage = lazy(() => import('src/pages/dashboard/invoice/new'));
const InvoiceEditPage = lazy(() => import('src/pages/dashboard/invoice/edit'));
// Employee
const EmployeeProfilePage = lazy(() => import('src/pages/dashboard/employee/profile'));
const EmployeeCardsPage = lazy(() => import('src/pages/dashboard/employee/cards'));
const EmployeeListPage = lazy(() => import('src/pages/dashboard/employee/list'));
const EmployeeCreatePage = lazy(() => import('src/pages/dashboard/employee/new'));
const EmployeeEditPage = lazy(() => import('src/pages/dashboard/employee/edit'));
// Account
const AccountGeneralPage = lazy(() => import('src/pages/dashboard/employee/account/general'));
const AccountBillingPage = lazy(() => import('src/pages/dashboard/employee/account/billing'));
const AccountSocialsPage = lazy(() => import('src/pages/dashboard/employee/account/socials'));
const AccountNotificationsPage = lazy(
  () => import('src/pages/dashboard/employee/account/notifications')
);
const AccountChangePasswordPage = lazy(
  () => import('src/pages/dashboard/employee/account/change-password')
);
// Blog
const BlogPostsPage = lazy(() => import('src/pages/dashboard/post/list'));
const BlogPostPage = lazy(() => import('src/pages/dashboard/post/details'));
const BlogNewPostPage = lazy(() => import('src/pages/dashboard/post/new'));
const BlogEditPostPage = lazy(() => import('src/pages/dashboard/post/edit'));
// Job
const JobDetailsPage = lazy(() => import('src/pages/dashboard/job/details'));
const JobListPage = lazy(() => import('src/pages/dashboard/job/list'));
const JobCreatePage = lazy(() => import('src/pages/dashboard/job/new'));
const JobEditPage = lazy(() => import('src/pages/dashboard/job/edit'));
// Tour
const TourDetailsPage = lazy(() => import('src/pages/dashboard/tour/details'));
const TourListPage = lazy(() => import('src/pages/dashboard/tour/list'));
const TourCreatePage = lazy(() => import('src/pages/dashboard/tour/new'));
const TourEditPage = lazy(() => import('src/pages/dashboard/tour/edit'));
// File manager
const FileManagerPage = lazy(() => import('src/pages/dashboard/file-manager'));
// App
const ChatPage = lazy(() => import('src/pages/dashboard/chat'));
const MailPage = lazy(() => import('src/pages/dashboard/mail'));
const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'));
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
// Test render page by role
const PermissionDeniedPage = lazy(() => import('src/pages/dashboard/permission'));
// Blank page
const ParamsPage = lazy(() => import('src/pages/dashboard/params'));
const BlankPage = lazy(() => import('src/pages/dashboard/blank'));
const BusinessDashboardPage = lazy(() => import('src/pages/dashboard/business-dashboard'));

// User

const UserProfileView = lazy(() => import('src/sections/user/view/user-profile-view'));


// Sales 
const SalesEmployeeDashboardPage = lazy(() => import('src/pages/sales/sales-employee-dashboard'));
const SalesClientsPage = lazy(() => import('src/pages/sales/sales-clients'));
const SalesClientDetailPage = lazy(() => import('src/pages/sales/sales-client-detail'));
const SalesDevelopmentPage = lazy(() => import('src/pages/sales/sales-development'));
const SalesBonusesPage = lazy(() => import('src/pages/sales/sales-bonuses'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

const accountLayout = () => (
  <AccountLayout>
    <SuspenseOutlet />
  </AccountLayout>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      // Начальная страница - перенаправляем на страницу метрик текущего пользователя для сотрудников
      // или на общий дашборд для админов и руководителей
      { 
        index: true, 
        element: (
          <RoleDepartmentGuard
            hasPermission={(user) => true}
            accessDeniedPath="/dashboard/metrics/employee/me"
          >
            <IndexPage />
          </RoleDepartmentGuard>
        ) 
      },
      
      // Секции с защитой доступа по отделу
      { 
        path: 'ecommerce', 
        element: (
          <RoleDepartmentGuard
            hasPermission={(user) => isAdmin(user) || hasAccessToDepartment(user, 'sales')}
            accessDeniedPath="/dashboard/metrics/employee/me"
          >
            <OverviewEcommercePage />
          </RoleDepartmentGuard>
        ) 
      },
      { 
        path: 'analytics', 
        element: (
          <RoleDepartmentGuard
            hasPermission={(user) => isAdmin(user) || isDepartmentHead(user)}
            accessDeniedPath="/dashboard/metrics/employee/me"
          >
            <OverviewAnalyticsPage />
          </RoleDepartmentGuard>
        ) 
      },
      { 
        path: 'banking', 
        element: (
          <RoleDepartmentGuard
            hasPermission={(user) => isAdmin(user) || hasAccessToDepartment(user, 'accounting')}
            accessDeniedPath="/dashboard/metrics/employee/me"
          >
            <OverviewBankingPage />
          </RoleDepartmentGuard>
        ) 
      },
      { 
        path: 'course', 
        element: (
          <RoleDepartmentGuard
            hasPermission={(user) => isAdmin(user) || hasAccessToDepartment(user, 'logistics')}
            accessDeniedPath="/dashboard/metrics/employee/me"
          >
            <OverviewCoursePage />
          </RoleDepartmentGuard>
        ) 
      },
      { path: 'profile/:id', element: <UserProfileView /> },

      { 
        path: 'file', 
        element: (
          <RoleDepartmentGuard
            hasPermission={(user) => isAdmin(user) || hasAccessToDepartment(user, 'manufacture')}
            accessDeniedPath="/dashboard/metrics/employee/me"
          >
            <OverviewFilePage />
          </RoleDepartmentGuard>
        ) 
      },
      {
        path: 'sales',
        children: [
          { 
            index: true, 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => isAdmin(user) || hasAccessToDepartment(user, 'sales')}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <SalesEmployeeDashboardPage />
              </RoleDepartmentGuard>
            ) 
          },
          { 
            path: 'clients', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => isAdmin(user) || hasAccessToDepartment(user, 'sales')}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <SalesClientsPage />
              </RoleDepartmentGuard>
            ) 
          },
          { 
            path: 'client/:id', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => isAdmin(user) || hasAccessToDepartment(user, 'sales')}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <SalesClientDetailPage />
              </RoleDepartmentGuard>
            ) 
          },
          { 
            path: 'development', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => isAdmin(user) || hasAccessToDepartment(user, 'sales')}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <SalesDevelopmentPage />
              </RoleDepartmentGuard>
            ) 
          },
          { 
            path: 'bonuses', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => isAdmin(user) || hasAccessToDepartment(user, 'sales')}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <SalesBonusesPage />
              </RoleDepartmentGuard>
            ) 
          }
        ]
      },
      
      // Защита маршрутов сотрудников
      {
        path: 'employee',
        children: [
          { 
            index: true, 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => isAdmin(user) || isDepartmentHead(user)}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <EmployeeProfilePage />
              </RoleDepartmentGuard>
            )
          },
          { 
            path: 'profile', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => isAdmin(user) || isDepartmentHead(user)}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <EmployeeProfilePage />
              </RoleDepartmentGuard>
            )
          },
          { 
            path: 'cards', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => isAdmin(user) || isDepartmentHead(user)}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <EmployeeCardsPage />
              </RoleDepartmentGuard>
            )
          },
          { 
            path: 'list', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => isAdmin(user) || isDepartmentHead(user)}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <EmployeeListPage />
              </RoleDepartmentGuard>
            )
          },
          { 
            path: 'new', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => isAdmin(user) || isDepartmentHead(user)}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <EmployeeCreatePage />
              </RoleDepartmentGuard>
            )
          },
          { 
            path: ':id/edit', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => isAdmin(user) || isDepartmentHead(user)}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <EmployeeEditPage />
              </RoleDepartmentGuard>
            )
          },
          {
            path: 'account',
            element: accountLayout(),
            children: [
              { index: true, element: <AccountGeneralPage /> },
              { path: 'billing', element: <AccountBillingPage /> },
              { path: 'notifications', element: <AccountNotificationsPage /> },
              { path: 'socials', element: <AccountSocialsPage /> },
              { path: 'change-password', element: <AccountChangePasswordPage /> },
            ],
          },
        ],
      },
      
      // Защита маршрутов продуктов
      {
        path: 'product',
        children: [
          { 
            index: true, 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => {
                  if (isAdmin(user) || isDepartmentHead(user)) return true;
                  return ['sales', 'manufacture'].includes(user?.employee?.department);
                }}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <ProductListPage />
              </RoleDepartmentGuard>
            )
          },
          { 
            path: 'list', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => {
                  if (isAdmin(user) || isDepartmentHead(user)) return true;
                  return ['sales', 'manufacture'].includes(user?.employee?.department);
                }}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <ProductListPage />
              </RoleDepartmentGuard>
            )
          },
          { 
            path: ':id', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => {
                  if (isAdmin(user) || isDepartmentHead(user)) return true;
                  return ['sales', 'manufacture'].includes(user?.employee?.department);
                }}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <ProductDetailsPage />
              </RoleDepartmentGuard>
            )
          },
          { 
            path: 'new', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => {
                  if (isAdmin(user) || isDepartmentHead(user)) return true;
                  return ['sales', 'manufacture'].includes(user?.employee?.department);
                }}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <ProductCreatePage />
              </RoleDepartmentGuard>
            )
          },
          { 
            path: ':id/edit', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => {
                  if (isAdmin(user) || isDepartmentHead(user)) return true;
                  return ['sales', 'manufacture'].includes(user?.employee?.department);
                }}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <ProductEditPage />
              </RoleDepartmentGuard>
            )
          },
        ],
      },
      
      // Защита маршрутов заказов
      {
        path: 'order',
        children: [
          { 
            index: true, 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => {
                  if (isAdmin(user) || isDepartmentHead(user)) return true;
                  return ['sales', 'logistics'].includes(user?.employee?.department);
                }}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <OrderListPage />
              </RoleDepartmentGuard>
            ) 
          },
          { 
            path: 'new', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => {
                  if (isAdmin(user) || isDepartmentHead(user)) return true;
                  return ['sales', 'logistics'].includes(user?.employee?.department);
                }}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <OrderCreatePage />
              </RoleDepartmentGuard>
            ) 
          },
          { 
            path: ':id', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => {
                  if (isAdmin(user) || isDepartmentHead(user)) return true;
                  return ['sales', 'logistics'].includes(user?.employee?.department);
                }}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <OrderDetailsPage />
              </RoleDepartmentGuard>
            ) 
          },
          { 
            path: ':id/edit', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => {
                  if (isAdmin(user) || isDepartmentHead(user)) return true;
                  return ['sales', 'logistics'].includes(user?.employee?.department);
                }}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <OrderEditPage />
              </RoleDepartmentGuard>
            ) 
          },
        ],
      },
      
      // Защита маршрутов счетов
      {
        path: 'invoice',
        children: [
          { 
            index: true, 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => {
                  if (isAdmin(user) || isDepartmentHead(user)) return true;
                  return ['sales', 'accounting'].includes(user?.employee?.department);
                }}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <InvoiceListPage />
              </RoleDepartmentGuard>
            )
          },
          { 
            path: 'list', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => {
                  if (isAdmin(user) || isDepartmentHead(user)) return true;
                  return ['sales', 'accounting'].includes(user?.employee?.department);
                }}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <InvoiceListPage />
              </RoleDepartmentGuard>
            )
          },
          { 
            path: ':id', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => {
                  if (isAdmin(user) || isDepartmentHead(user)) return true;
                  return ['sales', 'accounting'].includes(user?.employee?.department);
                }}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <InvoiceDetailsPage />
              </RoleDepartmentGuard>
            )
          },
          { 
            path: ':id/edit', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => {
                  if (isAdmin(user) || isDepartmentHead(user)) return true;
                  return ['sales', 'accounting'].includes(user?.employee?.department);
                }}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <InvoiceEditPage />
              </RoleDepartmentGuard>
            )
          },
          { 
            path: 'new', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => {
                  if (isAdmin(user) || isDepartmentHead(user)) return true;
                  return ['sales', 'accounting'].includes(user?.employee?.department);
                }}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <InvoiceCreatePage />
              </RoleDepartmentGuard>
            )
          },
        ],
      },
      
      // Маршруты для блога/обучения (доступны всем)
      {
        path: 'post',
        children: [
          { index: true, element: <BlogPostsPage /> },
          { path: 'list', element: <BlogPostsPage /> },
          { path: ':title', element: <BlogPostPage /> },
          { path: ':title/edit', element: <BlogEditPostPage /> },
          { path: 'new', element: <BlogNewPostPage /> },
        ],
      },
      
      // Маршруты метрик
      {
        path: 'metrics',
        children: [
          { 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => isAdmin(user) || isDepartmentHead(user)}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <BusinessDashboardPage />
              </RoleDepartmentGuard>
            ),
            index: true
          },
          { 
            path: 'business', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => isAdmin(user) || isDepartmentHead(user)}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <BusinessDashboardPage />
              </RoleDepartmentGuard>
            )
          },
          // Свои метрики доступны всем
          { path: 'employee/:id', element: <EmployeeMetricsPage /> },
          // Метрики отдела доступны только сотрудникам этого отдела и админам
          { 
            path: 'department/:department', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => {
                  const { department } = user?.params || {};
                  return isAdmin(user) || 
                         isDepartmentHead(user) || 
                         hasAccessToDepartment(user, department);
                }}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <DepartmentMetricsPage />
              </RoleDepartmentGuard>
            )
          },
        ],
      },

      // Уведомления - доступны всем
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      
      // Вакансии - доступны всем
      {
        path: 'job',
        children: [
          { index: true, element: <JobListPage /> },
          { path: 'list', element: <JobListPage /> },
          { path: ':id', element: <JobDetailsPage /> },
          { 
            path: 'new', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => isAdmin(user) || isDepartmentHead(user)}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <JobCreatePage />
              </RoleDepartmentGuard>
            )
          },
          { 
            path: ':id/edit', 
            element: (
              <RoleDepartmentGuard
                hasPermission={(user) => isAdmin(user) || isDepartmentHead(user)}
                accessDeniedPath="/dashboard/metrics/employee/me"
              >
                <JobEditPage />
              </RoleDepartmentGuard>
            )
          },
        ],
      },
      
      // Остальные маршруты доступны только для администраторов и руководителей
      { 
        path: 'tour',
        element: (
          <RoleDepartmentGuard
            hasPermission={(user) => isAdmin(user) || isDepartmentHead(user)}
            accessDeniedPath="/dashboard/metrics/employee/me"
          >
            <Navigate to="/dashboard/tour/list" replace />
          </RoleDepartmentGuard>
        ),
        children: [
          { element: <Navigate to="/dashboard/tour/list" replace />, index: true },
          { path: 'list', element: <TourListPage /> },
          { path: ':id', element: <TourDetailsPage /> },
          { path: 'new', element: <TourCreatePage /> },
          { path: ':id/edit', element: <TourEditPage /> },
        ],
      },
      { 
        path: 'file-manager', 
        element: (
          <RoleDepartmentGuard
            hasPermission={(user) => isAdmin(user) || isDepartmentHead(user)}
            accessDeniedPath="/dashboard/metrics/employee/me"
          >
            <FileManagerPage />
          </RoleDepartmentGuard>
        )
      },
      { 
        path: 'mail', 
        element: (
          <RoleDepartmentGuard
            hasPermission={(user) => isAdmin(user) || isDepartmentHead(user)}
            accessDeniedPath="/dashboard/metrics/employee/me"
          >
            <MailPage />
          </RoleDepartmentGuard>
        )
      },
      { 
        path: 'chat', 
        element: (
          <RoleDepartmentGuard
            hasPermission={(user) => isAdmin(user) || isDepartmentHead(user)}
            accessDeniedPath="/dashboard/metrics/employee/me"
          >
            <ChatPage />
          </RoleDepartmentGuard>
        )
      },
      { 
        path: 'calendar', 
        element: (
          <RoleDepartmentGuard
            hasPermission={(user) => isAdmin(user) || isDepartmentHead(user)}
            accessDeniedPath="/dashboard/metrics/employee/me"
          >
            <CalendarPage />
          </RoleDepartmentGuard>
        )
      },
      { 
        path: 'kanban', 
        element: (
          <RoleDepartmentGuard
            hasPermission={(user) => isAdmin(user) || isDepartmentHead(user)}
            accessDeniedPath="/dashboard/metrics/employee/me"
          >
            <KanbanPage />
          </RoleDepartmentGuard>
        )
      },
      { path: 'permission', element: <PermissionDeniedPage /> },
      { 
        path: 'params', 
        element: (
          <RoleDepartmentGuard
            hasPermission={(user) => isAdmin(user)}
            accessDeniedPath="/dashboard/metrics/employee/me"
          >
            <ParamsPage />
          </RoleDepartmentGuard>
        )
      },
      { 
        path: 'blank', 
        element: (
          <RoleDepartmentGuard
            hasPermission={(user) => isAdmin(user)}
            accessDeniedPath="/dashboard/metrics/employee/me"
          >
            <BlankPage />
          </RoleDepartmentGuard>
        )
      },
    ],
  },
];