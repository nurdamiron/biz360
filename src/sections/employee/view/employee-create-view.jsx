// employee-create-view.jsx

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { EmployeeNewEditForm } from '../employee-new-edit-form';

// ----------------------------------------------------------------------

export function EmployeeCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Создать профиль сотрудника"
        links={[
          { name: 'Дашборд', href: paths.dashboard.root  },
          { name: 'Сотрудники', href: paths.dashboard.employee.root },
          { name: 'Новый сотрудник' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <EmployeeNewEditForm />
    </DashboardContent>
  );
}
