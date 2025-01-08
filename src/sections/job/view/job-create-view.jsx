import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { JobNewEditForm } from '../job-new-edit-form';

// ----------------------------------------------------------------------

export function JobCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new job"
        links={[
          { name: 'Дашборд', href: paths.dashboard.root },
          { name: 'Вакансии', href: paths.dashboard.job.root },
          { name: 'Новая вакансия' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <JobNewEditForm />
    </DashboardContent>
  );
}
