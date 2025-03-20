// src/pages/sales/sales-bonuses.jsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, Box } from '@mui/material';
import { paths } from 'src/routes/paths';
import { useSalesData } from 'src/hooks/use-sales-data';
import { PotentialBonuses } from 'src/sections/sales/components';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export default function SalesBonusesPage() {
  // Загрузка данных о бонусах
  const { 
    data, 
    loading, 
    error, 
    refetch
  } = useSalesData({
    dataType: 'all',
    fetchOnMount: true
  });
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <>
      <Helmet>
        <title>Бонусы | Отдел продаж</title>
      </Helmet>
      
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          heading="Бонусы и мотивация"
          links={[
            { name: 'Главная', href: paths.dashboard.root },
            { name: 'Отдел продаж', href: paths.dashboard.sales?.root || '/dashboard/sales' },
            { name: 'Бонусы' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        {data?.metrics?.bonuses && (
          <PotentialBonuses bonuses={data.metrics.bonuses} />
        )}
      </Container>
    </>
  );
}