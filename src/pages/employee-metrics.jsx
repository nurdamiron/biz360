import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { DashboardContent } from 'src/layouts/dashboard';
import { EmployeeMetricsDashboard } from 'src/sections/metrics/employee-metrics-dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';

export default function EmployeeMetricsPage() {
  const { id } = useParams();

  return (
    <>
      <Helmet>
        <title>Метрики сотрудника | Система учета</title>
      </Helmet>

      <DashboardContent>
        <CustomBreadcrumbs
          heading="Метрики сотрудника"
          links={[
            { name: 'Главная', href: paths.dashboard.root },
            { name: 'Метрики', href: paths.dashboard.metrics.root },
            { name: 'Сотрудник' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        <EmployeeMetricsDashboard />
      </DashboardContent>
    </>
  );
}