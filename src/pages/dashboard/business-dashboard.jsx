// src/pages/dashboard/business-dashboard.jsx
import { Helmet } from 'react-helmet-async';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';

import BusinessOwnerDashboard from 'src/sections/dashboard/business-owner-dashboard';

export default function BusinessDashboardPage() {
  return (
    <>
      <Helmet>
        <title>Дашборд бизнеса | Система учета</title>
      </Helmet>

      <DashboardContent>
        <CustomBreadcrumbs
          heading="Дашборд владельца бизнеса"
          links={[
            { name: 'Главная', href: paths.dashboard.root },
            { name: 'Метрики', href: paths.dashboard.metrics.root },
            { name: 'Дашборд бизнеса' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        <BusinessOwnerDashboard />
      </DashboardContent>
    </>
  );
}