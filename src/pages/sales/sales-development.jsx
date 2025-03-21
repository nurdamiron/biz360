// src/pages/sales/sales-development.jsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { paths } from 'src/routes/paths';
import { DevelopmentPlan } from 'src/sections/sales/components';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// Прямой импорт мок-данных
import { mockEmployee } from 'src/sections/sales/_mock/sales-mock-data';

// ----------------------------------------------------------------------

export default function SalesDevelopmentPage() {
  // Локальное состояние вместо хука
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  
  // Прямая установка мок-данных после монтирования
  useEffect(() => {
    // Имитация короткой задержки для плавности UI
    const timer = setTimeout(() => {
      setEmployee(mockEmployee);
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>План развития | Отдел продаж</title>
      </Helmet>
      
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          heading="План развития"
          links={[
            { name: 'Мои показатели', href: paths.dashboard.sales.root },
            { name: 'План развития' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DevelopmentPlan employee={employee} />
        )}
      </Container>
    </>
  );
}