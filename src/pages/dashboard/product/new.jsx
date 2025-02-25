import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { ProductCreateView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

const metadata = { title: `Создать новый продукт - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ProductCreateView />
    </>
  );
}
