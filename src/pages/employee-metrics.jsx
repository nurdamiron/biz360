// src/pages/employee-metrics.jsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Navigate } from 'react-router-dom';
import { DashboardContent } from 'src/layouts/dashboard';
import { EmployeeMetricsDashboard } from 'src/sections/metrics/employee-metrics-dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useAuth } from 'src/auth/hooks';

import { isAdmin, isDepartmentHead } from 'src/auth/utils';

export default function EmployeeMetricsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  if (!user) {
    return <Navigate to={paths.auth.login} replace />;
  }
  
  // Если id = 'me', показываем текущего пользователя
  // Если указан другой id, проверяем права доступа
  const isViewingSelf = id === 'me';
  const isAdminOrHead = isAdmin(user) || isDepartmentHead(user);
  
  // Если обычный сотрудник пытается посмотреть чужие метрики, перенаправляем на свои
  if (!isViewingSelf && !isAdminOrHead) {
    return <Navigate to={paths.dashboard.metrics.employee('me')} replace />;
  }
  
  // Определяем заголовок
  const title = isViewingSelf ? 'Мои показатели' : 'Метрики сотрудника';
  
  return (
    <>
      <Helmet>
        <title>{title} | Система учета</title>
      </Helmet>
      <DashboardContent>
        <CustomBreadcrumbs
          heading={title}
          links={[
            { name: 'Главная', href: paths.dashboard.root },
            { name: 'Метрики', href: paths.dashboard.metrics.root },
            { name: isViewingSelf ? 'Мои показатели' : 'Сотрудник' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        <EmployeeMetricsDashboard />
      </DashboardContent>
    </>
  );
}