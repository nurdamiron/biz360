import { useState, useEffect } from 'react';
import { useTabs } from 'minimal-shared/hooks';
import { varAlpha } from 'minimal-shared/utils';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { PRODUCT_PUBLISH_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import { ProductDetailsSkeleton } from '../product-skeleton';
import { ProductDetailsReview } from '../product-details-review';
import { ProductDetailsSummary } from '../product-details-summary';
import { ProductDetailsToolbar } from '../product-details-toolbar';
import { ProductDetailsCarousel } from '../product-details-carousel';
import { ProductDetailsDescription } from '../product-details-description';

const SUMMARY = [
  {
    title: '100% original',
    description: 'Chocolate bar candy canes ice cream toffee cookie halvah.',
    icon: 'solar:verified-check-bold',
  },
  {
    title: '10 days replacement',
    description: 'Marshmallow biscuit donut dragée fruitcake wafer.',
    icon: 'solar:clock-circle-bold',
  },
  {
    title: 'Year warranty',
    description: 'Cotton candy gingerbread cake I love sugar sweet.',
    icon: 'solar:shield-check-bold',
  },
];

export function ProductDetailsView({ product, error, loading }) {
  const tabs = useTabs('description');
  const [publish, setPublish] = useState('');

  useEffect(() => {
    if (product) {
      setPublish(product.publish || 'published');
    }
  }, [product]);

  const handleChangePublish = (newValue) => {
    setPublish(newValue);
  };

  if (loading) {
    return (
      <DashboardContent sx={{ pt: 5 }}>
        <ProductDetailsSkeleton />
      </DashboardContent>
    );
  }

  if (error || !product) {
    return (
      <DashboardContent sx={{ pt: 5 }}>
        <EmptyContent
          filled
          title={error?.message || "Product not found!"}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.product.root}
              startIcon={<Iconify width={16} icon="eva:arrow-ios-back-fill" />}
              sx={{ mt: 3 }}
            >
              Back to list
            </Button>
          }
          sx={{ py: 10, height: 'auto', flexGrow: 'unset' }}
        />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <ProductDetailsToolbar
        backHref={paths.dashboard.product.root}
        liveHref={paths.product.details(product.id)}
        editHref={paths.dashboard.product.edit(product.id)}
        publish={publish}
        onChangePublish={handleChangePublish}
        publishOptions={PRODUCT_PUBLISH_OPTIONS}
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
            disableActions 
            product={product}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          gap: 5,
          my: 10,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            md: 'repeat(3, 1fr)'
          },
        }}
      >
        {SUMMARY.map((item) => (
          <Box key={item.title} sx={{ textAlign: 'center', px: 5 }}>
            <Iconify 
              icon={item.icon} 
              width={32} 
              sx={{ color: 'primary.main' }} 
            />

            <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
              {item.title}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.description}
            </Typography>
          </Box>
        ))}
      </Box>

      <Card>
        <Tabs
          value={tabs.value}
          onChange={tabs.onChange}
          sx={{
            px: 3,
            boxShadow: (theme) => 
              `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
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

        {tabs.value === 'reviews' && (
          <ProductDetailsReview
            ratings={product.ratings}
            reviews={product.reviews}
            totalRatings={product.totalRating}
            totalReviews={product.totalReviews}
          />
        )}
      </Card>
    </DashboardContent>
  );
}