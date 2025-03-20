// src/pages/sales/sales-clients.jsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, Box } from '@mui/material';
import { paths } from 'src/routes/paths';
import { useSalesData } from 'src/hooks/use-sales-data';
import { ClientsList } from 'src/sections/sales/components';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export default function SalesClientsPage() {
  // Загрузка данных клиентов
  const { 
    data, 
    activeClients,
    completedDeals,
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
        <title>Клиенты | Отдел продаж</title>
      </Helmet>
      
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          heading="Мои клиенты"
          links={[
            { name: 'Главная', href: paths.dashboard.root },
            { name: 'Отдел продаж', href: paths.dashboard.sales?.root || '/dashboard/sales' },
            { name: 'Клиенты' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        <ClientsList 
          activeClients={activeClients || []} 
          completedDeals={completedDeals || []}
        />
      </Container>
    </>
  );
}