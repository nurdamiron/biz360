// employee-edit-view.jsx

import { paths } from 'src/routes/paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { EmployeeNewEditForm } from '../../employee-new-edit-form';

// ----------------------------------------------------------------------

/**
 * Окно "Edit" — показывает форму `EmployeeNewEditForm` в режиме редактирования.
 * @param {Object} props
 * @param {Object} props.employee - Объект сотрудника, загруженный заранее
 */
export function EmployeeEditView({ employee: currentEmployee }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.dashboard.employee.list}
        links={[
          { name: 'Дашборд', href: paths.dashboard.root  },
          { name: 'Сотрудник', href: paths.dashboard.employee.root },
          { name: currentEmployee?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Передаем сотрудника в форму */}
      <EmployeeNewEditForm currentEmployee={currentEmployee} />
    </DashboardContent>
  );
}
