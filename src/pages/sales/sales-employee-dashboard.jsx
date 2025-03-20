// src/pages/sales/sales-employee-dashboard.jsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { paths } from 'src/routes/paths';
import { useAuth } from 'src/auth/hooks/use-auth';
import { useSalesData } from 'src/hooks/use-sales-data';
import { SalesEmployeeDashboard } from 'src/sections/sales/SalesEmployeeDashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export default function SalesEmployeeDashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Загрузка всех данных для дашборда
  const { 
    data, 
    loading, 
    error, 
    refetch
  } = useSalesData({
    dataType: 'all',
    fetchOnMount: true
  });
  
  // Проверка доступа к разделу отдела продаж
  useEffect(() => {
    if (isAuthenticated && user && user.department !== 'sales' && 
        user.role !== 'admin' && user.role !== 'owner') {
      navigate(paths.dashboard.root, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <>
      <Helmet>
        <title>Отдел продаж | Дашборд</title>
      </Helmet>
      
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          heading="Отдел продаж"
          links={[
            { name: 'Главная', href: paths.dashboard.root },
            { name: 'Отдел продаж' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        <SalesEmployeeDashboard />
      </Container>
    </>
  );
}