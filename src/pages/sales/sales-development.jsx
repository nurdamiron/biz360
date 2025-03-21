import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, Box, CircularProgress} from '@mui/material';
import { Navigate } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import { DevelopmentPlan } from 'src/sections/sales/components';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useAuth } from 'src/auth/hooks/use-auth';

// Assuming this import exists based on the pattern in other files
import { mockEmployee } from 'src/sections/sales/_mock/sales-mock-data';

// ----------------------------------------------------------------------
export default function SalesDevelopmentPage() {
  const { user } = useAuth();
  // Локальное состояние вместо хука
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  
  // All hooks first, before any conditions
  useEffect(() => {
    // Создаем данные для текущего пользователя на основе моков
    const timer = setTimeout(() => {
      // Объединяем мок-данные с данными текущего пользователя
      setEmployeeData(mockEmployee);
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
        <title>План развития | Отдел продаж</title>
      </Helmet>
      
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          heading="План развития"
          links={[
            { name: 'Главная', href: paths.dashboard.root },
            { name: 'Мой дашборд', href: paths.dashboard.sales.root },
            { name: 'План развития' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DevelopmentPlan employee={employeeData} />
        )}
      </Container>
    </>
  );
}