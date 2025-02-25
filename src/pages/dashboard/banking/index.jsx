import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { AccountingDashboard } from 'src/sections/overview/banking/view';

// ----------------------------------------------------------------------

const metadata = { title: `Бухгалтерский учет - ${CONFIG.appName}` };

export default function Page() {
  // ... логика проверки доступа для бухгалтерии
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <AccountingDashboard />
    </>
  );
}
