import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { InvoiceListView } from 'src/sections/invoice/view';

// ----------------------------------------------------------------------

const metadata = { title: `Список счетов | Дашборд - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <InvoiceListView />
    </>
  );
}
