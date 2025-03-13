// src/sections/order/view/order-create-view.jsx
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { OrderNewEditForm } from '../order-new-edit-form';

export function OrderCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Создание заказа"
        links={[
          { name: 'Главная', href: paths.dashboard.root },
          { name: 'Заказы', href: paths.dashboard.order.root },
          { name: 'Новый заказ' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <OrderNewEditForm />
    </DashboardContent>
  );
}