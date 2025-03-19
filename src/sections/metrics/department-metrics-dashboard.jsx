// src/sections/metrics/department-metrics-dashboard.jsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Container,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Tab,
  Tabs,
  Button,
  Skeleton,
  useMediaQuery
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';


// Импорт компонентов
import MetricCard from './components/MetricCard';
import PerformanceChart from './components/PerformanceChart';
import EmployeeMetricsTable from './components/EmployeeMetricsTable';
import EmployeePerformanceBarChart from './components/EmployeePerformanceBarChart';
import EmployeeStatsWidget from './components/EmployeeStatsWidget';
import FinancialMetricsCard from './components/FinancialMetricsCard';
import OperationalMetricsCard from './components/OperationalMetricsCard';

// Импорт функций мок-данных
import {
  generateEmployeesMockData,
  generatePerformanceHistory,
  shouldUseMockData
} from 'src/utils/mockData';

// Импорт дополнительных утилит
import axiosInstance from 'src/lib/axios';

export function DepartmentMetricsDashboard() {
  const { department } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Флаг для использования мок-данных
  const useMockData = true;
  
  // Определение цвета отдела
  const getDepartmentColor = (deptCode) => {
    const colors = {
      'sales': theme.palette.primary.main,
      'accounting': theme.palette.info.main,
      'logistics': theme.palette.warning.main,
      'manufacture': theme.palette.success.main
    };
    return colors[deptCode] || theme.palette.primary.main;
  };
  
  // Переведение названия отдела на русский
  const getDepartmentName = (deptCode) => {
    const names = {
      'sales': 'Отдел продаж',
      'accounting': 'Бухгалтерия',
      'logistics': 'Логистика',
      'manufacture': 'Производство'
    };
    return names[deptCode] || deptCode;
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        if (shouldUseMockData(useMockData)) {
          // Используем мок-данные
          const employeesData = generateEmployeesMockData(12);
          
          // Фильтруем сотрудников по отделу, если указан
          const departmentEmployees = department ? 
            employeesData.filter(emp => emp.department === department) : 
            employeesData;
          
          // Расчет средних значений для метрик отдела
          const avgOverallPerformance = Math.round(
            departmentEmployees.reduce((sum, emp) => sum + (emp.metrics.overall_performance || 0), 0) / departmentEmployees.length
          );
          
          const avgKpi = Math.round(
            departmentEmployees.reduce((sum, emp) => sum + (emp.metrics.kpi || 0), 0) / departmentEmployees.length
          );
          
          const avgWorkVolume = Math.round(
            departmentEmployees.reduce((sum, emp) => sum + (emp.metrics.work_volume || 0), 0) / departmentEmployees.length
          );
          
          const avgActivity = Math.round(
            departmentEmployees.reduce((sum, emp) => sum + (emp.metrics.activity || 0), 0) / departmentEmployees.length
          );
          
          const avgQuality = Math.round(
            departmentEmployees.reduce((sum, emp) => sum + (emp.metrics.quality || 0), 0) / departmentEmployees.length
          );
          
          const avgSpeed = Math.round(
            departmentEmployees.reduce((sum, emp) => sum + (emp.metrics.speed || 0), 0) / departmentEmployees.length
          );
          
          const avgPlanCompletion = Math.round(
            departmentEmployees.reduce((sum, emp) => sum + (emp.metrics.plan_completion || 0), 0) / departmentEmployees.length
          );
          
          // Собираем данные метрик отдела
          const mockData = {
            department: department || 'sales',
            metrics: {
              averages: {
                overall_performance: avgOverallPerformance,
                kpi: avgKpi,
                work_volume: avgWorkVolume,
                activity: avgActivity,
                quality: avgQuality,
                speed: avgSpeed,
                plan_completion: avgPlanCompletion
              },
              // Добавляем финансовые и операционные показатели
              financial: {
                revenue: 15000000,
                revenue_target: 20000000,
                margin: 68,
                margin_target: 75,
                growth: 12,
                growth_target: 15
              },
              operational: {
                timeliness: 82,
                completion: 88,
                efficiency: 79
              }
            },
            employees: departmentEmployees,
            history: generatePerformanceHistory(6, avgKpi - 10, 15)
          };
          
          setTimeout(() => {
            setMetrics(mockData);
            setLoading(false);
          }, 800); // Искусственная задержка для демонстрации загрузки
        } else {
          // Запрос реальных данных
          const response = await axiosInstance.get(`/api/metrics/department/${department}`);
          setMetrics(response.data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching department metrics:', err);
        setError('Не удалось загрузить метрики отдела. ' + (err.message || 'Неизвестная ошибка'));
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [department, useMockData, theme]);
  
  // Функция для изменения активной вкладки
  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };
  
  // Компонент для отображения скелетонов загрузки
  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 2 }} />
      </Grid>
      
      {Array.from({ length: 4 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
      
      <Grid item xs={12}>
        <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
      </Grid>
      
      <Grid item xs={12}>
        <Skeleton variant="rectangular" width="100%" height={500} sx={{ borderRadius: 2 }} />
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Container maxWidth="xl">
        <LoadingSkeleton />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert 
          severity="error" 
          sx={{ 
            mt: 2, 
            boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
            borderRadius: 2
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!metrics) {
    return (
      <Container maxWidth="xl">
        <Alert 
          severity="warning" 
          sx={{ 
            mt: 2, 
            boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
            borderRadius: 2
          }}
        >
          Нет данных для отображения
        </Alert>
      </Container>
    );
  }

  const { metrics: departmentMetrics, employees, history } = metrics;
  const departmentColor = getDepartmentColor(metrics.department);
  
  // Находим лучшего сотрудника по KPI
  const topEmployee = [...employees].sort((a, b) => (b.metrics.kpi || 0) - (a.metrics.kpi || 0))[0];

  return (
    <Container maxWidth="xl">
      {/* Заголовок отдела */}
      <LazyMotion features={domAnimation}>

      <Paper
        component={m.div}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{
          p: 3,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 2,
          boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
          bgcolor: alpha(departmentColor, 0.08),
          border: `1px solid ${alpha(departmentColor, 0.2)}`
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" color={departmentColor}>
            {getDepartmentName(metrics.department)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Всего сотрудников: {employees.length}
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          sx={{ 
            bgcolor: departmentColor,
            '&:hover': {
              bgcolor: alpha(departmentColor, 0.8)
            }
          }}
        >
          Отчет по отделу
        </Button>
      </Paper>
      </LazyMotion>


      
      {/* Навигация по вкладкам */}
      <Paper 
        sx={{ 
          borderRadius: 2,
          boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
          mb: 3
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            px: 2,
            '& .MuiTab-root': {
              py: 2
            }
          }}
        >
          <Tab label="Обзор" />
          <Tab label="Сотрудники" />
          <Tab label="Показатели" />
          <Tab label="Графики" />
        </Tabs>
      </Paper>
      
      {/* Вкладка "Обзор" */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Основные метрики отдела */}
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              title="Средний KPI"
              value={departmentMetrics.averages.kpi}
              trend={5} // Пример тренда
              description="Среднее значение KPI по отделу"
              icon="⭐" // Тут можно использовать иконку
              bgColor={departmentColor}
              showProgress
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              title="Объем работы"
              value={departmentMetrics.averages.work_volume}
              trend={3} // Пример тренда
              description="Средний объем выполняемой работы"
              icon="📈" // Тут можно использовать иконку
              bgColor={theme.palette.info.main}
              showProgress
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              title="Качество работы"
              value={departmentMetrics.averages.quality}
              trend={-2} // Пример тренда
              description="Среднее качество выполнения работы"
              icon="✓" // Тут можно использовать иконку
              bgColor={theme.palette.success.main}
              showProgress
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              title="Скорость"
              value={departmentMetrics.averages.speed || 75}
              trend={1} // Пример тренда
              description="Средняя скорость выполнения задач"
              icon="⚡" // Тут можно использовать иконку
              bgColor={theme.palette.warning.main}
              showProgress
            />
          </Grid>
          
          {/* Виджет статистики по сотрудникам */}
          <Grid item xs={12} md={4}>
            <EmployeeStatsWidget
              employees={employees}
              topEmployee={topEmployee}
              onRefresh={() => console.log("Refresh stats")}
            />
          </Grid>
          
          {/* Операционные и финансовые показатели */}
          <Grid item xs={12} md={4}>
            <FinancialMetricsCard
              metrics={{
                revenue: 15000000,
                revenue_target: 20000000,
                margin: 68,
                margin_target: 75,
                growth: 12,
                growth_target: 15
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <OperationalMetricsCard
              metrics={{
                timeliness: 82,
                completion: 88,
                efficiency: 79
              }}
            />
          </Grid>
          
          {/* График трендов */}
          <Grid item xs={12}>
            <PerformanceChart
              data={history}
              title="Тренды отдела"
              subheader="Динамика изменения ключевых показателей по месяцам"
            />
          </Grid>
          
          {/* Распределение KPI */}
          <Grid item xs={12}>
            <EmployeePerformanceBarChart
              employees={employees}
              departmentColor={departmentColor}
              title="Рейтинг сотрудников"
              subheader="Сравнение показателей сотрудников отдела"
            />
          </Grid>
        </Grid>
      )}
      
      {/* Вкладка "Сотрудники" */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <EmployeeMetricsTable
              employees={employees}
              departmentColor={departmentColor}
              onShowAll={() => console.log("Show all employees")}
            />
          </Grid>
        </Grid>
      )}
      
      {/* Вкладка "Показатели" */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
            }}>
              <CardHeader title="Финансовые показатели отдела" />
              <Divider />
              <CardContent>
                <FinancialMetricsCard
                  metrics={departmentMetrics.financial}
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
            }}>
              <CardHeader title="Операционные показатели отдела" />
              <Divider />
              <CardContent>
                <OperationalMetricsCard
                  metrics={departmentMetrics.operational}
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
            }}>
              <CardHeader 
                title="Средние показатели отдела" 
                subheader="Усредненные значения метрик по всем сотрудникам"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  {Object.entries(departmentMetrics.averages).map(([key, value]) => {
                    // Перевод ключей на русский
                    const metricLabels = {
                      overall_performance: 'Общая эффективность',
                      kpi: 'KPI',
                      work_volume: 'Объем работы',
                      activity: 'Активность',
                      quality: 'Качество работы',
                      speed: 'Скорость',
                      plan_completion: 'Выполнение плана'
                    };
                    
                    // Иконки для метрик
                    const metricIcons = {
                      overall_performance: '📊',
                      kpi: '⭐',
                      work_volume: '📈',
                      activity: '🏃',
                      quality: '✓',
                      speed: '⚡',
                      plan_completion: '📅'
                    };
                    
                    // Цвета для метрик
                    const metricColors = {
                      overall_performance: theme.palette.primary.main,
                      kpi: theme.palette.info.main,
                      work_volume: theme.palette.warning.main,
                      activity: theme.palette.secondary.main,
                      quality: theme.palette.success.main,
                      speed: theme.palette.error.main,
                      plan_completion: '#6B7280'
                    };
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={key}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 1, 
                          border: `1px solid ${theme.palette.divider}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          '&:hover': {
                            boxShadow: theme.customShadows?.z4 || '0 4px 8px 0 rgba(145, 158, 171, 0.16)',
                          }
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ 
                              mr: 2,
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: alpha(metricColors[key] || departmentColor, 0.1),
                              color: metricColors[key] || departmentColor,
                              fontSize: '1.2rem'
                            }}>
                              {metricIcons[key] || '🔍'}
                            </Box>
                            <Typography variant="body2">
                              {metricLabels[key] || key}
                            </Typography>
                          </Box>
                          <Typography variant="h6" fontWeight="bold" color={metricColors[key] || departmentColor}>
                            {Math.round(value)}%
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Вкладка "Графики" */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <PerformanceChart
              data={history}
              title="Тренды показателей отдела"
              subheader="Динамика изменения метрик за период"
              showControls
            />
          </Grid>
          
          <Grid item xs={12}>
            <EmployeePerformanceBarChart
              employees={employees}
              departmentColor={departmentColor}
              title="Сравнение сотрудников"
              subheader="Распределение показателей среди сотрудников отдела"
            />
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default DepartmentMetricsDashboard;