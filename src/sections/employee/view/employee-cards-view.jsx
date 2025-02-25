import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _employeeCards } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { EmployeeCardList } from '../employee-card-list';

// ----------------------------------------------------------------------

export function EmployeeCardsView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Карточки сотрудников"
        links={[
          { name: 'Дашборд', href: paths.dashboard.root },
          { name: 'Сотрудники', href: paths.dashboard.employee.root },
          { name: 'Карточки сотрудников' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.employee.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Новый сотрудник
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <EmployeeCardList employees={_employeeCards} />
    </DashboardContent>
  );
}
