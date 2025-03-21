// src/pages/sales/sales-clients.jsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import { ClientsList } from 'src/sections/sales/components';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useAuth } from 'src/auth/hooks/use-auth';

// Прямой импорт мок-данных
import { 
  mockActiveClients, 
  mockCompletedDeals,
  mockNewAssignments
} from 'src/sections/sales/_mock/sales-mock-data';

// ----------------------------------------------------------------------
export default function SalesClientsPage() {
  const { user } = useAuth();
  // Локальное состояние вместо хука
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState({
    activeClients: [],
    completedDeals: [],
    newAssignments: []
  });
  
  // All hooks first, before any conditions
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
  
  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  if (!user) {
    return <Navigate to={paths.auth.login} replace />;
  }
  
  // Проверяем принадлежность к отделу продаж или наличие прав админа
  const isSalesEmployee = user.department === 'sales' || user.role === 'admin' || user.role === 'owner' || user.role === 'head';
  if (!isSalesEmployee) {
    return <Navigate to={paths.dashboard.root} replace />;
  }
  
  return (
    <>
      <Helmet>
        <title>Мои клиенты | Отдел продаж</title>
      </Helmet>
      
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          heading="Мои клиенты"
          links={[
            { name: 'Главная', href: paths.dashboard.root },
            { name: 'Мой дашборд', href: paths.dashboard.sales.root },
            { name: 'Мои клиенты' }
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