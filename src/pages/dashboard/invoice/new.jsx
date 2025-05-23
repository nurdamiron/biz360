import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { InvoiceCreateView } from 'src/sections/invoice/view';

// ----------------------------------------------------------------------

const metadata = { title: `Создать счет | Дашборд - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <InvoiceCreateView />
    </>
  );
}
