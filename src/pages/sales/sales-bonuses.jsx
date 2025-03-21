// src/pages/sales/sales-bonuses.jsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { paths } from 'src/routes/paths';
import { PotentialBonuses } from 'src/sections/sales/components';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// Прямой импорт мок-данных
import { mockMetrics } from 'src/sections/sales/_mock/sales-mock-data';

// ----------------------------------------------------------------------

export default function SalesBonusesPage() {
  // Локальное состояние вместо хука
  const [loading, setLoading] = useState(true);
  const [bonuses, setBonuses] = useState(null);
  
  // Прямая установка мок-данных после монтирования
  useEffect(() => {
    // Имитация короткой задержки для плавности UI
    const timer = setTimeout(() => {
      setBonuses(mockMetrics.bonuses);
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>Мотивационная программа | Отдел продаж</title>
      </Helmet>
      
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          heading="Мотивационная программа"
          links={[
            { name: 'Мои показатели', href: paths.dashboard.sales.root },
            { name: 'Мотивационная программа' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <PotentialBonuses bonuses={bonuses} />
        )}
      </Container>
    </>
  );
}