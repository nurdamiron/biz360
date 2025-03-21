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
  
  // Получаем ID сотрудника (из параметра или текущего пользователя)
  const getEmployeeId = () => {
    if (id && id !== 'me') return id;
    return user?.id;
  };
  
  // Загрузка данных сотрудника
  useEffect(() => {
    const employeeId = getEmployeeId();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Загружаем данные сотрудника
        const employeeResponse = await employeeService.getEmployeeById(employeeId);
        setEmployeeData(employeeResponse.data);
        
        // Загружаем метрики сотрудника
        const metricsResponse = await metricsService.getEmployeeMetrics(employeeId);
        setMetrics(metricsResponse.data);
        
        // Загружаем данные продаж
        const salesResponse = await employeeService.getEmployeeSalesData(employeeId);
        setSalesData(salesResponse.data);
        
      } catch (err) {
        console.error('Error fetching employee data:', error);
        setError(error.message || 'Не удалось загрузить данные сотрудника');
        enqueueSnackbar('Не удалось загрузить данные сотрудника', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    if (employeeId) {
      fetchData();
    }
  }, [id, user, enqueueSnackbar]);
  
  // Отображаем индикатор загрузки в центре экрана
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
  
  // Используем свойство key для полной перезагрузки компонента при изменении ID
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