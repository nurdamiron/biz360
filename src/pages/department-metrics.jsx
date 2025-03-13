import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { DashboardContent } from 'src/layouts/dashboard';
import { DepartmentMetricsDashboard } from 'src/sections/metrics/department-metrics-dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';

export default function DepartmentMetricsPage() {
  const { department } = useParams();
  
  // Функция для получения названия отдела на русском
  const getDepartmentName = (code) => {
    const departments = {
      sales: 'Продажи',
      accounting: 'Бухгалтерия',
      logistics: 'Логистика',
    };
    return departments[code] || code;
  };

  return (
    <>
      <Helmet>
        <title>Метрики отдела | Система учета</title>
      </Helmet>

      <DashboardContent>
        <CustomBreadcrumbs
          heading={`Метрики отдела ${getDepartmentName(department)}`}
          links={[
            { name: 'Главная', href: paths.dashboard.root },
            { name: 'Метрики', href: paths.dashboard.metrics.root },
            { name: 'Отдел' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        <DepartmentMetricsDashboard />
      </DashboardContent>
    </>
  );
}