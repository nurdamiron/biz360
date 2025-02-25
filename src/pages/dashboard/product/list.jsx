import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { ProductListView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

const metadata = { title: `Список продуктов - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ProductListView />
    </>
  );
}
