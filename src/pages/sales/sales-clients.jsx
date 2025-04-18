// src/pages/sales/sales-clients.jsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import { ClientsList } from 'src/sections/sales/components';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useAuth } from 'src/auth/hooks/use-auth';
import { shouldUseMockData } from 'src/utils/mock-data-utils';

// Импортируем мок-данные только в режиме разработки
import { 
  mockActiveClients, 
  mockCompletedDeals,
  mockNewAssignments
} from 'src/sections/sales/_mock/sales-mock-data';

// ----------------------------------------------------------------------
export default function SalesClientsPage() {
  const { user } = useAuth();
  // Локальное состояние для данных и UI
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState({
    activeClients: [],
    completedDeals: [],
    newAssignments: []
  });
  const [error, setError] = useState(null);
  
  // All hooks first, before any conditions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Выполняем загрузку мок-данных только если включен режим разработки
        if (shouldUseMockData()) {
          // Имитация короткой задержки для плавности UI
          await new Promise(resolve => setTimeout(resolve, 300));
          
          setClients({
            activeClients: mockActiveClients,
            completedDeals: mockCompletedDeals,
            newAssignments: mockNewAssignments
          });
        } else {
          // В режиме рабочего API начальные данные теперь будут загружаться
          // через хук useCustomers внутри компонента ClientsList
          // Тем не менее всё равно загружаем новые назначения, которые
          // используются для верхнего блока
          setClients({
            activeClients: [],
            completedDeals: [],
            newAssignments: mockNewAssignments // В будущем заменить на реальные данные
          });
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных клиентов:', err);
        setError('Не удалось загрузить данные клиентов. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
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
        
        {/* Показываем ошибку, если есть */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
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