import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';
import { _orders } from 'src/_mock/_order';
import { CONFIG } from 'src/global-config';
import { OrderEditView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

const metadata = { title: `Редактирование заказа - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();
  
  const currentOrder = _orders.find((order) => order.id === id);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <OrderEditView order={currentOrder} />
    </>
  );
}