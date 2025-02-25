import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { OverviewFileView } from 'src/sections/overview/file/view';

// ----------------------------------------------------------------------

const metadata = { title: `File | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <OverviewFileView />
    </>
  );
}

// Для корпоративного дашборда
export function CorporateDashboardPage() {
  // Проверка на owner/admin роли
}
