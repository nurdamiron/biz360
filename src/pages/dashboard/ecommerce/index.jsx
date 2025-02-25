
// src/pages/dashboard/ecommerce/index.jsx

import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { SalesDashboard } from 'src/sections/overview/e-commerce/view';

// ----------------------------------------------------------------------

const metadata = { title: `Продажи - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <SalesDashboard />
    </>
  );
}
