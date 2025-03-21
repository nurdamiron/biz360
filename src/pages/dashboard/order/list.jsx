// src/pages/dashboard/order/list.jsx

import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { OrderListView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

const metadata = { title: `Список заказов - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <OrderListView />
    </>
  );
}
