// src/pages/department-metrics.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Container,
  Alert,
  Button,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CONFIG } from 'src/global-config';
import axiosInstance, { endpoints } from 'src/lib/axios';

// Импортируем компоненты метрик напрямую
import MetricCard from '../sections/metrics/components/MetricCard';
import EmployeeStatsWidget from '../sections/metrics/components/EmployeeStatsWidget';
import EmployeeMetricsTable from '../sections/metrics/components/EmployeeMetricsTable';
import PerformanceChart from '../sections/metrics/components/PerformanceChart';
import EmployeePerformanceBarChart from '../sections/metrics/components/EmployeePerformanceBarChart';
import FinancialMetricsCard from '../sections/metrics/components/FinancialMetricsCard';
import OperationalMetricsCard from '../sections/metrics/components/OperationalMetricsCard';

// Константы и служебные функции
// Получение русского названия отдела по коду
const getDepartmentLabel = (code) => {
  const deptLabels = {
    sales: 'Отдел продаж',
    accounting: 'Бухгалтерия',
    logistics: 'Отдел логистики',
    manufacture: 'Производство'
  };
  return deptLabels[code] || code;
};

// Получение цвета отдела
const getDepartmentColor = (code) => {
  const colors = {
    sales: '#4CAF50',      // Зеленый
    accounting: '#2196F3',  // Синий
    logistics: '#FF9800',   // Оранжевый
    manufacture: '#9C27B0'  // Фиолетовый
  };
  return colors[code] || '#757575';  // Серый по умолчанию
};

// Главный компонент страницы
export default function DepartmentMetricsPage() {
  const { department } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Обработчик обновления данных
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMetrics();
    setRefreshing(false);
  };

  // Функция получения метрик отдела с сервера
  const fetchMetrics = async () => {
    if (!department) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Загружаем метрики отдела: ${department}`);
      const response = await axiosInstance.get(endpoints.metrics.department(department));
      console.log('Получены данные:', response.data);
      setMetrics(response.data);
    } catch (err) {
      console.error(`Ошибка загрузки метрик отдела ${department}:`, err);
      setError(`Не удалось загрузить метрики отдела: ${err.message}`);
      
      // Здесь можно добавить функцию для генерации тестовых данных,
      // если бэкенд недоступен
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных при монтировании или изменении отдела
  useEffect(() => {
    fetchMetrics();
  }, [department]);

  // Генерация тестовых данных для отладки
  const generateMockData = () => {
    const employees = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `Сотрудник ${i + 1}`,
      role: i === 0 ? 'head' : i < 3 ? 'manager' : 'employee',
      metrics: {
        overall_performance: Math.floor(50 + Math.random() * 50),
        kpi: Math.floor(50 + Math.random() * 50),
        work_volume: Math.floor(40 + Math.random() * 60),
        quality: Math.floor(40 + Math.random() * 60),
        financial: Math.floor(40 + Math.random() * 60),
        operational: Math.floor(40 + Math.random() * 60)
      }
    }));

    // Сортируем сотрудников по KPI (убывание)
    employees.sort((a, b) => b.metrics.kpi - a.metrics.kpi);

    // Рассчитываем средние значения
    const calculateAverage = (field) => employees.reduce((sum, emp) => sum + emp.metrics[field], 0) / employees.length;

    const averages = {
      overall_performance: calculateAverage('overall_performance'),
      kpi: calculateAverage('kpi'),
      work_volume: calculateAverage('work_volume'),
      quality: calculateAverage('quality'),
      financial: calculateAverage('financial'),
      operational: calculateAverage('operational')
    };

    // Генерируем данные для графика истории метрик
    const historyData = Array.from({ length: 12 }, (_, i) => {
      const month = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'][i];
      return {
        month,
        performance: Math.floor(40 + Math.random() * 60),
        kpi: Math.floor(40 + Math.random() * 60),
        quality: Math.floor(40 + Math.random() * 60),
        financial: Math.floor(40 + Math.random() * 60),
        operational: Math.floor(40 + Math.random() * 60)
      };
    });

    // Генерируем финансовые метрики
    const financialMetrics = {
      revenue: Math.floor(800000 + Math.random() * 400000),
      revenue_target: 1000000,
      margin: Math.floor(20 + Math.random() * 15),
      margin_target: 30,
      growth: Math.floor(5 + Math.random() * 10),
      growth_target: 10
    };

    // Генерируем операционные метрики
    const operationalMetrics = {
      timeliness: Math.floor(70 + Math.random() * 30),
      completion: Math.floor(70 + Math.random() * 30),
      efficiency: Math.floor(70 + Math.random() * 30)
    };

    return {
      department: {
        code: department,
        label: getDepartmentLabel(department)
      },
      employees,
      metrics: {
        averages,
        trends: {
          performance_trend: Math.floor(-5 + Math.random() * 10),
          kpi_trend: Math.floor(-5 + Math.random() * 10),
          quality_trend: Math.floor(-5 + Math.random() * 10)
        },
        history: historyData,
        financial: financialMetrics,
        operational: operationalMetrics
      }
    };
  };

  // Показываем загрузку
  if (loading && !refreshing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // Если данные отсутствуют и произошла ошибка
  if (!metrics && !loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Повторить
            </Button>
          }
        >
          {error || 'Нет данных для отображения. Проверьте подключение к серверу.'}
        </Alert>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => {
            const mockData = generateMockData();
            setMetrics(mockData);
          }}
          sx={{ mt: 2 }}
        >
          Загрузить тестовые данные
        </Button>
      </Container>
    );
  }

  // Распаковываем данные из объекта метрик
  const { metrics: departmentMetrics = {}, employees = [], department: deptInfo = {} } = metrics || {};
  const departmentColor = getDepartmentColor(department);
  
  // Находим сотрудника с лучшим KPI
  const topEmployee = employees.length > 0 ? employees[0] : null;
  
  // История метрик по месяцам
  const historyData = departmentMetrics.history || [];
  
  // Финансовые и операционные метрики
  const financialMetrics = departmentMetrics.financial || {};
  const operationalMetrics = departmentMetrics.operational || {};
  
  return (
    <>
      <Helmet>
        <title>{`Метрики ${getDepartmentLabel(department)} - ${CONFIG.appName}`}</title>
      </Helmet>

      <Container maxWidth="xl">
        {/* Заголовок и верхняя панель */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'flex-start' : 'center',
            mb: 3,
            mt: 2
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              Метрики отдела: {getDepartmentLabel(department)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Анализ эффективности и показателей отдела
            </Typography>
          </Box>
          
          <Box sx={{ mt: isMobile ? 2 : 0 }}>
            <Button 
              variant="contained" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Обновление...' : 'Обновить данные'}
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                Повторить
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        
        {refreshing && (
          <Box display="flex" justifyContent="center" sx={{ py: 2 }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography variant="body2">Обновление данных...</Typography>
          </Box>
        )}

        <Grid container spacing={3}>
          {/* Раздел 1: Основные показатели производительности */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Ключевые показатели отдела
            </Typography>
          </Grid>
          
          {/* Карточки с основными метриками */}
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              title="Общая эффективность" 
              value={departmentMetrics.averages?.overall_performance || 0}
              trend={departmentMetrics.trends?.performance_trend}
              description="Комплексная оценка работы отдела" 
              bgColor={departmentColor}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              title="Средний KPI" 
              value={departmentMetrics.averages?.kpi || 0}
              trend={departmentMetrics.trends?.kpi_trend}
              description="Ключевой показатель эффективности" 
              bgColor={departmentColor}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              title="Объем работы" 
              value={departmentMetrics.averages?.work_volume || 0}
              description="Выполнение плановых задач" 
              bgColor={departmentColor}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              title="Качество работы" 
              value={departmentMetrics.averages?.quality || 0} 
              trend={departmentMetrics.trends?.quality_trend}
              description="Оценка качества выполнения"
              bgColor={departmentColor}
            />
          </Grid>

          {/* Раздел 2: Метрики сотрудников - график и статистика */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
              Метрики сотрудников
            </Typography>
          </Grid>
          
          {/* График эффективности сотрудников */}
          <Grid item xs={12} md={8}>
            <EmployeePerformanceBarChart 
              employees={employees} 
              departmentColor={departmentColor}
              title="Распределение показателей среди сотрудников"
              subheader="Сравнение KPI, количества и качества работы"
            />
          </Grid>

          {/* Виджет статистики сотрудников */}
          <Grid item xs={12} md={4}>
            <EmployeeStatsWidget 
              employees={employees} 
              topEmployee={topEmployee} 
              onRefresh={handleRefresh}
            />
          </Grid>

          {/* Раздел 3: Динамика метрик за период */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
              Динамика метрик за период
            </Typography>
          </Grid>
          
          {/* График динамики метрик */}
          <Grid item xs={12}>
            <PerformanceChart 
              data={historyData}
              title="Динамика показателей отдела за год"
              subheader="Изменение метрик по месяцам"
            />
          </Grid>

          {/* Раздел 4: Финансовые и операционные показатели */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
              Финансовые и операционные показатели
            </Typography>
          </Grid>
          
          {/* Финансовые показатели */}
          <Grid item xs={12} md={6}>
            <FinancialMetricsCard metrics={financialMetrics} />
          </Grid>
          
          {/* Операционные показатели */}
          <Grid item xs={12} md={6}>
            <OperationalMetricsCard metrics={operationalMetrics} />
          </Grid>

          {/* Раздел 5: Детальная таблица сотрудников */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
              Детальная информация о сотрудниках
            </Typography>
          </Grid>
          
          {/* Таблица сотрудников */}
          <Grid item xs={12}>
            <EmployeeMetricsTable 
              employees={employees} 
              departmentColor={departmentColor}
              onShowAll={() => {
                // Здесь может быть логика для показа всех сотрудников
                console.log('Показать всех сотрудников');
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}