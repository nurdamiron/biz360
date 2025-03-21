// src/pages/sales/sales-employee-dashboard.jsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { paths } from 'src/routes/paths';
import { useAuth } from 'src/auth/hooks/use-auth';
import { SalesEmployeeDashboard } from 'src/sections/sales/SalesEmployeeDashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// Import mock data directly
import { 
  mockEmployee, 
  mockMetrics, 
  mockActiveClients, 
  mockCompletedDeals,
  mockSalesPerformance,
  mockImprovements,
  mockChartData
} from 'src/sections/sales/_mock/sales-mock-data';

// ----------------------------------------------------------------------

export default function SalesEmployeeDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Load mock data directly without delay
  useEffect(() => {
    // Create a combined data object from mock data
    const combinedData = {
      employee: mockEmployee,
      metrics: mockMetrics,
      activeClients: mockActiveClients,
      completedDeals: mockCompletedDeals,
      salesPerformance: mockSalesPerformance,
      improvements: mockImprovements,
      chartData: mockChartData
    };
    
    setData(combinedData);
    setLoading(false);
  }, []);
  
  // Check access to sales department
  useEffect(() => {
    // Напрямую используем мок-данные без асинхронной загрузки
    setData({ metrics: { bonuses: mockMetrics.bonuses } });
    setLoading(false);
  }, []);
  
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