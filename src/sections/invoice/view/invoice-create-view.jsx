// invoice-create-view.jsx
import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { InvoiceNewEditForm } from '../invoice-new-edit-form';

// ----------------------------------------------------------------------

export function InvoiceCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Создать новый счет"
        links={[
          { name: 'Дашборд', href: paths.dashboard.general.file },
          { name: 'Бухгалтерия', href: paths.dashboard.invoice.root },
          { name: 'Создать новый счет' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <InvoiceNewEditForm />
    </DashboardContent>
  );
}
