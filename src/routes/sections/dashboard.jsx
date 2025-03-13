// src/routes/sections/dashboard.jsx
import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AccountLayout } from 'src/sections/account/account-layout';

import { AuthGuard } from 'src/auth/guard';

import { usePathname } from '../hooks';


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
  const OrderListPage = lazy(() => import('src/pages/dashboard/order/list'));
const OrderCreateView = lazy(() => import('src/pages/dashboard/order/create'));
const OrderDetailsView = lazy(() => import('src/pages/dashboard/order/details'));
const OrderEditView = lazy(() => import('src/pages/dashboard/order/edit'));
const OrderListView = lazy(() => import('src/pages/dashboard/order/list'));

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
      { index: true, element: <IndexPage /> },
      { path: 'ecommerce', element: <OverviewEcommercePage /> },
      { path: 'analytics', element: <OverviewAnalyticsPage /> },
      { path: 'banking', element: <OverviewBankingPage /> },
      { path: 'booking', element: <OverviewBookingPage /> },
      { path: 'file', element: <OverviewFilePage /> },
      { path: 'course', element: <OverviewCoursePage /> },
      {
        path: 'employee',
        children: [
          { index: true, element: <EmployeeProfilePage /> },
          { path: 'profile', element: <EmployeeProfilePage /> },
          { path: 'cards', element: <EmployeeCardsPage /> },
          { path: 'list', element: <EmployeeListPage /> },
          { path: 'new', element: <EmployeeCreatePage /> },
          { path: ':id/edit', element: <EmployeeEditPage /> },
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
      {
        path: 'product',
        children: [
          { index: true, element: <ProductListPage /> },
          { path: 'list', element: <ProductListPage /> },
          { path: ':id', element: <ProductDetailsPage /> },
          { path: 'new', element: <ProductCreatePage /> },
          { path: ':id/edit', element: <ProductEditPage /> },
        ],
      },
      {
        path: 'order',
        children: [
          { element: <OrderListView />, index: true },
          { path: 'new', element: <OrderCreateView /> },
          { path: ':id', element: <OrderDetailsView /> },
          { path: ':id/edit', element: <OrderEditView /> },
        ],
      },
      {
        path: 'invoice',
        children: [
          { index: true, element: <InvoiceListPage /> },
          { path: 'list', element: <InvoiceListPage /> },
          { path: ':id', element: <InvoiceDetailsPage /> },
          { path: ':id/edit', element: <InvoiceEditPage /> },
          { path: 'new', element: <InvoiceCreatePage /> },
        ],
      },
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
      {
        path: 'metrics',
        children: [
          { element: <BusinessDashboardPage />, index: true }, // Установим дашборд бизнеса как главную страницу метрик
          { path: 'business', element: <BusinessDashboardPage /> },
          { path: 'employee/:id', element: <EmployeeMetricsPage /> },
          { path: 'department/:department', element: <DepartmentMetricsPage /> },
        ],
      },

      // {
      //   path: 'customers',
      //   children: [
      //     { element: <CustomersListPage />, index: true },
      //     { path: 'list', element: <CustomersListPage /> },
      //     { path: 'cards', element: <CustomersCardsPage /> },
      //     { path: 'create', element: <CustomerCreatePage /> },
      //     { path: ':id', element: <CustomerDetailsPage /> },
      //     { path: ':id/edit', element: <CustomerEditPage /> },
      //   ],
      // },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'job',
        children: [
          { index: true, element: <JobListPage /> },
          { path: 'list', element: <JobListPage /> },
          { path: ':id', element: <JobDetailsPage /> },
          { path: 'new', element: <JobCreatePage /> },
          { path: ':id/edit', element: <JobEditPage /> },
        ],
      },
      {
        path: 'tour',
        children: [
          { index: true, element: <TourListPage /> },
          { path: 'list', element: <TourListPage /> },
          { path: ':id', element: <TourDetailsPage /> },
          { path: 'new', element: <TourCreatePage /> },
          { path: ':id/edit', element: <TourEditPage /> },
        ],
      },
      { path: 'file-manager', element: <FileManagerPage /> },
      { path: 'mail', element: <MailPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'kanban', element: <KanbanPage /> },
      { path: 'permission', element: <PermissionDeniedPage /> },
      { path: 'params', element: <ParamsPage /> },
      { path: 'blank', element: <BlankPage /> },
    ],
  },
];
