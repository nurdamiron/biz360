import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PostNewEditForm } from '../post-new-edit-form';

// ----------------------------------------------------------------------

export function PostCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new post"
        links={[
          { name: 'Главная страница', href: paths.dashboard.root },
          { name: 'Блог', href: paths.dashboard.post.root },
          { name: 'Создать' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PostNewEditForm />
    </DashboardContent>
  );
}
