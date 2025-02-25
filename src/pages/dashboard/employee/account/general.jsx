import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { AccountGeneralView } from 'src/sections/account/view';

// ----------------------------------------------------------------------

const metadata = { title: `Общие настройки аккаунта - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <AccountGeneralView />
    </>
  );
}
