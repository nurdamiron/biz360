import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/global-config';
import { OrderCreateView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

const metadata = { title: `Создание заказа - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <OrderCreateView />
    </>
  );
}