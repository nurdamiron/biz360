import { useEffect, useRef, useState } from 'react';
import { useTabs } from 'minimal-shared/hooks';
import { varAlpha } from 'minimal-shared/utils';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CartIcon } from '../cart-icon';
import { useCheckoutContext } from '../../checkout/context';
import { ProductDetailsSkeleton } from '../product-skeleton';
import { ProductDetailsReview } from '../product-details-review';
import { ProductDetailsSummary } from '../product-details-summary';
import { ProductDetailsCarousel } from '../product-details-carousel';
import { ProductDetailsDescription } from '../product-details-description';

const WS_URL = import.meta.env.VITE_WS_URL || 'wss://biz360-backend.onrender.com/ws';

const DEFAULT_PRODUCT = {
  id: '',
  name: '',
  description: '',
  images: [],
  colors: [],
  sizes: [],
  reviews: [],
  ratings: [],
  totalRatings: 0,
  totalReviews: 0,
  available: 0,
  price: 0,
  price_sale: null,
  new_label: null,
  sale_label: null,
  inventoryType: 'in stock',
};

const transformRatings = (ratings = []) => 
  ratings.map(rating => ({
    name: `${rating.stars} Star`,
    starCount: rating.count || 0,
    reviewCount: rating.reviews || 0
  }));

const transformReviews = (reviews = []) => 
  reviews.map(review => ({
    id: review.id || `review-${Math.random()}`,
    name: review.userName || 'Anonymous',
    rating: Number(review.rating) || 0,
    content: review.comment || '',
    date: review.createdAt ? new Date(review.createdAt) : new Date()
  }));

export function ProductShopDetailsView({ 
  productId, 
  error: initialError, 
  loading: initialLoading 
}) {
  const { state: checkoutState, onAddToCart } = useCheckoutContext();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(initialLoading || true);
  const [error, setError] = useState(initialError || null);
  const ws = useRef(null);
  const tabs = useTabs('description');

  const fetchProduct = async () => {
    try {
      const response = await fetch(
        `https://biz360-backend.onrender.com/api/product/details/${productId}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch product data');
      }

      const transformedProduct = {
        ...DEFAULT_PRODUCT,
        ...result.data,
        ratings: transformRatings(result.data.ratings),
        reviews: transformReviews(result.data.reviews),
        available: Number(result.data.available) || 0,
        price: Number(result.data.price) || 0,
        price_sale: result.data.price_sale ? Number(result.data.price_sale) : null,
        new_label: result.data.new_label || null,
        sale_label: result.data.sale_label || null,
      };

      setProduct(transformedProduct);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    if (!productId || !window.WebSocket) return;

    try {
      ws.current = new WebSocket(`${WS_URL}?productId=${productId}`);

      ws.current.onmessage = (event) => {
        try {
          const updatedData = JSON.parse(event.data);
          
          if (updatedData.id === productId) {
            setProduct(prev => {
              if (!prev) return prev;
              
              return {
                ...prev,
                ...updatedData,
                ratings: updatedData.ratings ? transformRatings(updatedData.ratings) : prev.ratings,
                reviews: updatedData.reviews ? transformReviews(updatedData.reviews) : prev.reviews,
              };
            });
          }
        } catch (wsError) {
          console.error('WebSocket message processing error:', wsError);
        }
      };

      ws.current.onerror = (wsError) => {
        console.error('WebSocket error:', wsError);
      };

      ws.current.onclose = () => {
        ws.current = null;
      };

    } catch (wsError) {
      console.error('WebSocket setup error:', wsError);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  useEffect(() => {
    setupWebSocket();

    return () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [productId]);

  if (loading) {
    return (
      <Container sx={{ mt: 5, mb: 10 }}>
        <ProductDetailsSkeleton />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ mt: 5, mb: 10 }}>
        <EmptyContent
          filled
          title={error?.message || 'Product not found!'}
          action={
            <Button
              component={RouterLink}
              href={paths.product.root}
              startIcon={<Iconify width={16} icon="eva:arrow-ios-back-fill" />}
              sx={{ mt: 3 }}
            >
              Back to List
            </Button>
          }
          sx={{ py: 10 }}
        />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 5, mb: 10 }}>
      <CartIcon totalItems={checkoutState.totalItems} />

      <CustomBreadcrumbs
        links={[
          { name: 'Home', href: '/' },
          { name: 'Shop', href: paths.product.root },
          { name: product.name || 'Product Details' },
        ]}
        sx={{ mb: 5 }}
      />

      <Grid container spacing={{ xs: 3, md: 5, lg: 8 }}>
        <Grid size={{ xs: 12, md: 6, lg: 7 }}>
          <ProductDetailsCarousel 
            productId={product.id} 
            initialImages={product.images} 
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 5 }}>
          <ProductDetailsSummary
            productId={product.id}
            items={checkoutState.items}
            onAddToCart={onAddToCart}
            disableActions={!product.available}
          />
        </Grid>
      </Grid>

      <Card sx={{ mt: 5 }}>
        <Tabs
          value={tabs.value}
          onChange={tabs.onChange}
          sx={{
            px: 3,
            boxShadow: (theme) => 
              `inset 0 -2px 0 0 ${varAlpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          <Tab value="description" label="Description" />
          {product.reviews?.length > 0 && (
            <Tab 
              value="reviews" 
              label={`Reviews (${product.reviews.length})`} 
            />
          )}
        </Tabs>

        {tabs.value === 'description' && (
          <ProductDetailsDescription 
            productId={product.id}
            initialDescription={product.description}
          />
        )}

        {tabs.value === 'reviews' && product.reviews?.length > 0 && (
          <ProductDetailsReview
            ratings={product.ratings}
            reviews={product.reviews}
            totalRatings={product.totalRatings}
            totalReviews={product.totalReviews}
          />
        )}
      </Card>
    </Container>
  );
}