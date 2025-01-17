import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _userCards } from 'src/_mock';
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
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Employee', href: paths.dashboard.employee.root },
          { name: 'Cards' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.employee.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New employee
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <EmployeeCardList employees={_userCards} />
    </DashboardContent>
  );
}
