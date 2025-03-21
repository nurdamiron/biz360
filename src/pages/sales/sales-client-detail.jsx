// src/pages/sales/sales-client-detail.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, Box, Paper, Alert, CircularProgress } from '@mui/material';
import { paths } from 'src/routes/paths';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export default function SalesClientDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  
  // Имитация загрузки данных с имитированной задержкой
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>Информация о клиенте | Отдел продаж</title>
      </Helmet>
      
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          heading="Информация о клиенте"
          links={[
            { name: 'Мои показатели', href: paths.dashboard.sales.root },
            { name: 'Клиенты', href: paths.dashboard.sales.clients },
            { name: 'Детали клиента' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Alert severity="info">
              Страница детальной информации о клиенте ID: {id}.
              Эта страница находится в разработке и будет доступна в ближайшее время.
            </Alert>
          </Paper>
        )}
      </Container>
    </>
  );
}