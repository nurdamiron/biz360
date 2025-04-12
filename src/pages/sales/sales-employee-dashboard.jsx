// src/pages/sales/sales-employee-dashboard.jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Container, CircularProgress, Box } from '@mui/material';
import { useAuth } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';

// Импорт компонентов дашборда
import { SalesEmployeeDashboard} from 'src/sections/sales';

// Импорт сервисов для работы с данными
import employeeService from 'src/services/employee-service';
import metricsService from 'src/services/metrics-service';

// ----------------------------------------------------------------------

export default function SalesEmployeeDashboardPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [error, setError] = useState(null);
  
  const getEmployeeId = () => {
    if (id && id !== 'me') return id;
    return user?.employee?.id || user?.id; 
  };
  
  useEffect(() => {
    const employeeId = getEmployeeId();
    
    if (!employeeId) {
      console.error('No employee ID found');
      setError('Не удалось определить ID сотрудника');
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Используйте Promise.allSettled для более надежной обработки
        const [employeeResponse, metricsResponse, salesResponse] = await Promise.allSettled([
          employeeService.getEmployeeById(employeeId),
          metricsService.getEmployeeMetrics(employeeId),
          employeeService.getEmployeeSalesData(employeeId)
        ]);
        
        // Проверяем каждый ответ
        if (employeeResponse.status === 'fulfilled') {
          setEmployeeData(employeeResponse.value.data);
        } else {
          throw employeeResponse.reason;
        }
        
        if (metricsResponse.status === 'fulfilled') {
          setMetrics(metricsResponse.value.data);
        } else {
          throw metricsResponse.reason;
        }
        
        if (salesResponse.status === 'fulfilled') {
          setSalesData(salesResponse.value.data);
        } else {
          throw salesResponse.reason;
        }
        
      } catch (err) {
        console.error('Detailed error fetching data:', err);
        setError(err.message || 'Не удалось загрузить данные сотрудника');
        enqueueSnackbar(err.message || 'Не удалось загрузить данные сотрудника', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, user, enqueueSnackbar]);
  
  // Добавим дополнительный лог
  useEffect(() => {
    console.log('Render state:', { 
      loading, 
      employeeData, 
      metrics, 
      salesData, 
      error 
    });
  });
  
  if (loading && !employeeData) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '80vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth={false} disableGutters>
      <SalesEmployeeDashboard
        key={`dashboard-${getEmployeeId()}`}
        employeeData={employeeData}
        metrics={metrics}
        salesData={salesData}
        error={error}
        loading={loading}
      />
    </Container>
  );
}