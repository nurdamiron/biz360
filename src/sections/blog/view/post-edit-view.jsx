import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PostNewEditForm } from '../post-new-edit-form';

// ----------------------------------------------------------------------

export function PostEditView({ post }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.dashboard.post.root}
        links={[
          { name: 'Главная страница', href: paths.dashboard.root },
          { name: 'Блог', href: paths.dashboard.post.root },
          { name: post?.title },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PostNewEditForm currentPost={post} />
    </DashboardContent>
  );
}
