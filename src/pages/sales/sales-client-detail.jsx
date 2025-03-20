// src/pages/sales/sales-client-detail.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, Box, Paper, Alert } from '@mui/material';
import { paths } from 'src/routes/paths';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export default function SalesClientDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  
  // Имитация загрузки данных
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <>
      <Helmet>
        <title>Информация о клиенте | Отдел продаж</title>
      </Helmet>
      
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          heading="Информация о клиенте"
          links={[
            { name: 'Главная', href: paths.dashboard.root },
            { name: 'Отдел продаж', href: paths.dashboard.sales?.root || '/dashboard/sales' },
            { name: 'Клиенты', href: paths.dashboard.sales?.clients || '/dashboard/sales/clients' },
            { name: 'Детали клиента' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Alert severity="info">
            Страница детальной информации о клиенте ID: {id}.
            Эта страница находится в разработке и будет доступна в ближайшее время.
          </Alert>
        </Paper>
      </Container>
    </>
  );
}