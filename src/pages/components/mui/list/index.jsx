import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { ListView } from 'src/sections/_examples/mui/list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Список | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ListView />
    </>
  );
}
