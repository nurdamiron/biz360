// src/pages/sales/sales-clients.jsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { paths } from 'src/routes/paths';
import { ClientsList } from 'src/sections/sales/components';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// Прямой импорт мок-данных
import { 
  mockActiveClients, 
  mockCompletedDeals,
  mockNewAssignments
} from 'src/sections/sales/_mock/sales-mock-data';

// ----------------------------------------------------------------------

export default function SalesClientsPage() {
  // Локальное состояние вместо хука
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState({
    activeClients: [],
    completedDeals: [],
    newAssignments: []
  });
  
  // Прямая установка мок-данных после монтирования
  useEffect(() => {
    // Имитация короткой задержки для плавности UI
    const timer = setTimeout(() => {
      setClients({
        activeClients: mockActiveClients,
        completedDeals: mockCompletedDeals,
        newAssignments: mockNewAssignments
      });
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>Клиенты | Отдел продаж</title>
      </Helmet>
      
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          heading="Мои клиенты"
          links={[
            { name: 'Мои показатели', href: paths.dashboard.sales.root },
            { name: 'Клиенты' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ClientsList 
            activeClients={clients.activeClients} 
            completedDeals={clients.completedDeals}
            newAssignments={clients.newAssignments}
          />
        )}
      </Container>
    </>
  );
}