import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';
import { CONFIG } from 'src/global-config';
import { useGetProduct } from 'src/actions/product';
import { ProductDetailsView } from 'src/sections/product/view';

const metadata = { title: `Детали продукта - ${CONFIG.appName}` };

export default function Page() {
  const { id } = useParams();
  console.log('Product ID from URL:', id); // Debug log

  const { product, productLoading, productError } = useGetProduct(id);
  console.log('Product Data:', { id, product, productLoading, productError }); // Debug log

  if (!id) {
    return (
      <ProductDetailsView 
        product={null} 
        loading={false} 
        error={{ message: 'Product ID is required' }} 
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ProductDetailsView 
        product={product} 
        loading={productLoading} 
        error={productError} 
      />
    </>
  );
}