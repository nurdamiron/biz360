import { Helmet } from 'react-helmet-async';

import { DashboardContent } from 'src/layouts/dashboard';
import { NotificationList } from 'src/sections/notifications/notification-list';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';

export default function NotificationsPage() {
  return (
    <>
      <Helmet>
        <title>Уведомления | Система учета</title>
      </Helmet>

      <DashboardContent>
        <CustomBreadcrumbs
          heading="Уведомления"
          links={[
            { name: 'Главная', href: paths.dashboard.root },
            { name: 'Уведомления' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        <NotificationList />
      </DashboardContent>
    </>
  );
}