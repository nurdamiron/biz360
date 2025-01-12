import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { VerifyView } from 'src/auth/view/jwt/';

// ----------------------------------------------------------------------

const metadata = { title: `Верификация | Jwt - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <VerifyView />
    </>
  );
}
