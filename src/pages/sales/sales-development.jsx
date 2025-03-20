// src/pages/sales/sales-development.jsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, Box } from '@mui/material';
import { paths } from 'src/routes/paths';
import { useAuth } from 'src/auth/hooks/use-auth';
import { useSalesData } from 'src/hooks/use-sales-data';
import { DevelopmentPlan } from 'src/sections/sales/components';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export default function SalesDevelopmentPage() {
  const { user } = useAuth();
  
  // Загрузка данных для плана развития
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
        <title>План развития | Отдел продаж</title>
      </Helmet>
      
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          heading="План развития"
          links={[
            { name: 'Главная', href: paths.dashboard.root },
            { name: 'Отдел продаж', href: paths.dashboard.sales?.root || '/dashboard/sales' },
            { name: 'План развития' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        {data?.employee && (
          <DevelopmentPlan employee={data.employee} />
        )}
      </Container>
    </>
  );
}