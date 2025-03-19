// src/sections/metrics/employee-metrics-dashboard.jsx
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
  Avatar,
  Button,
  Tab,
  Tabs,
  useMediaQuery,
  Container,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Chip,
  Skeleton
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { LazyMotion, domAnimation, m } from 'framer-motion';

// Импорт компонентов
import MetricCard from './components/MetricCard';
import PerformanceChart from './components/PerformanceChart';
import FinancialMetricsCard from './components/FinancialMetricsCard';
import OperationalMetricsCard from './components/OperationalMetricsCard';
import MetricsSelector from './components/MetricsSelector';

// Импорт иконок (можно заменить на символы, если иконки не установлены)
// import AssessmentIcon from '@mui/icons-material/Assessment';
// import SpeedIcon from '@mui/icons-material/Speed';
// import WorkIcon from '@mui/icons-material/Work';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import ScheduleIcon from '@mui/icons-material/Schedule';

// Импорт функций мок-данных
import {
  generateEmployeeFullMetrics,
  generatePerformanceHistory,
  shouldUseMockData
} from 'src/utils/mockData';

// Импорт дополнительных утилит
import axiosInstance from 'src/lib/axios';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { fNumber, fPercent } from 'src/utils/format-number';

// Компонент для отображения специфичных метрик по отделам
const DepartmentSpecificMetrics = ({ department, metrics }) => {
  const theme = useTheme();
  const [displayedMetrics, setDisplayedMetrics] = useState(['performance', 'kpi', 'quality']);
  const [chartType, setChartType] = useState('line');

  if (!department || !metrics.specific_metrics) {
    return null;
  }
  
  
  // Компонент для отдела продаж
  if (department === 'sales' && metrics.specific_metrics.sales) {
    const salesMetrics = metrics.specific_metrics.sales;
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
         
              <FinancialMetricsCard
                metrics={{
                  revenue: salesMetrics.revenue,
                  revenue_target: salesMetrics.revenue_target,
                  margin: salesMetrics.conversion_rate,
                  margin_target: salesMetrics.conversion_target,
                  growth: 5, // Пример значения
                  growth_target: 10
                }}
              />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
          }}>
            <CardHeader title="Советы по улучшению" />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="body2">
                  Ваши показатели конверсии близки к целевым! Вот несколько советов для улучшения:
                </Typography>
                <Box 
                  component="ul" 
                  sx={{ 
                    pl: 2,
                    '& li': {
                      mb: 1,
                      pb: 1,
                      borderBottom: `1px dashed ${theme.palette.divider}`
                    },
                    '& li:last-child': {
                      mb: 0,
                      pb: 0,
                      borderBottom: 'none'
                    }
                  }}
                >
                  <Typography component="li" variant="body2">
                    Уделите больше внимания квалификации лидов
                  </Typography>
                  <Typography component="li" variant="body2">
                    Следуйте стандартному скрипту продаж
                  </Typography>
                  <Typography component="li" variant="body2">
                    Предлагайте сопутствующие товары для увеличения среднего чека
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
  
  // Компонент для бухгалтерии
  if (department === 'accounting' && metrics.specific_metrics.accounting) {
    const accMetrics = metrics.specific_metrics.accounting;
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>

              <OperationalMetricsCard
                metrics={{
                  timeliness: 90,
                  completion: accMetrics.accuracy,
                  efficiency: (accMetrics.documents_processed / accMetrics.documents_target) * 100
                }}
              />
        </Grid>
      </Grid>
    );
  }
  
  // Компонент для логистики
  if (department === 'logistics' && metrics.specific_metrics.logistics) {
    const logisticsMetrics = metrics.specific_metrics.logistics;
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
          }}>
            <CardHeader title="Показатели логистики" />
            <Divider />
            <CardContent>
              <OperationalMetricsCard
                metrics={{
                  timeliness: logisticsMetrics.delivery_timeliness,
                  completion: 85,
                  efficiency: logisticsMetrics.route_efficiency
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
  
  // Компонент для производства
  if (department === 'manufacture' && metrics.specific_metrics.manufacture) {
    const mfgMetrics = metrics.specific_metrics.manufacture;
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
         
              <OperationalMetricsCard
                metrics={{
                  timeliness: 88,
                  completion: mfgMetrics.production_efficiency,
                  efficiency: mfgMetrics.quality_rate
                }}
              />

        </Grid>
      </Grid>
    );
  }
  
  return null;
};

// Основной компонент дашборда метрик сотрудника
export function EmployeeMetricsDashboard() {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Флаг для использования мок-данных
  const useMockData = true;
  
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        if (shouldUseMockData(useMockData)) {
          // Используем мок-данные
          const mockData = generateEmployeeFullMetrics(id || 1, true);
          setTimeout(() => {
            setMetrics(mockData);
            setLoading(false);
          }, 800); // Искусственная задержка для демонстрации загрузки
        } else {
          // Если ID не указан, используем 'me' для получения метрик текущего пользователя
          const targetId = id || 'me';
          const response = await axiosInstance.get(`/api/metrics/employee/${targetId}`);
          
          if (response.data.success) {
            setMetrics(response.data);
          } else {
            setError(response.data.error || 'Не удалось загрузить метрики');
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Не удалось загрузить метрики. ' + (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
        setLoading(false);
      }
    };
  
    fetchMetrics();
  }, [id, useMockData]);
  
  // Функция для изменения активной вкладки
  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };
  
  // Компонент для отображения скелетонов загрузки
  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 2 }} />
      </Grid>
      
      {Array.from({ length: 4 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
      
      <Grid item xs={12}>
        <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
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
          Нет данных для отображения. Возможно, ваш профиль еще не настроен.
        </Alert>
      </Container>
    );
  }
  
  const { employee, metrics: employeeMetrics, bonuses, history, department_comparison } = metrics;
  
  // Подготовка данных для графика истории
  const chartData = history.map(item => ({
    date: format(new Date(item.date), 'd MMM', { locale: ru }),
    kpi: item.kpi || 0,
    performance: item.overall_performance || 0,
    work_volume: item.work_volume || 0,
    quality: item.quality || 0,
    speed: item.speed || 0,
    plan_completion: item.plan_completion || 0
  })).reverse();
  
  // Данные для графика трендов по месяцам
  const monthlyTrendData = generatePerformanceHistory(6, employeeMetrics.kpi - 10, 10);
  
  // Перевод названия отдела на русский
  const getDepartmentName = (code) => {
    const departments = {
      'sales': 'Отдел продаж',
      'accounting': 'Бухгалтерия',
      'logistics': 'Логистика',
      'manufacture': 'Производство'
    };
    return departments[code] || code;
  };
  
  // Перевод роли на русский
  const getRoleName = (code) => {
    const roles = {
      'owner': 'Владелец',
      'admin': 'Администратор',
      'head': 'Руководитель',
      'manager': 'Менеджер',
      'employee': 'Сотрудник'
    };
    return roles[code] || code;
  };
  
  // Получение цвета для аватара в зависимости от роли
  const getAvatarColor = (role) => {
    const roleColors = {
      'owner': theme.palette.error.main,
      'admin': theme.palette.warning.main,
      'head': theme.palette.info.main,
      'manager': theme.palette.primary.main,
      'employee': theme.palette.success.main
    };
    return roleColors[role] || theme.palette.primary.main;
  };
  
  return (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        {/* Карточка с информацией о сотруднике */}
        <Grid item xs={12}>
          <LazyMotion features={domAnimation}>
            <Paper
              component={m.div}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              sx={{
                p: 3,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                gap: 2,
                borderRadius: 2,
                boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
            {/* Декоративный элемент для фона */}
            <Box 
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '30%',
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0)} 50%)`,
                display: { xs: 'none', md: 'block' }
              }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: getAvatarColor(employee.role),
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  boxShadow: `0 0 0 4px ${alpha(getAvatarColor(employee.role), 0.2)}`
                }}
              >
                {employee.name.charAt(0)}
              </Avatar>
              
              <Box>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                  {employee.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={getDepartmentName(employee.department)} 
                    color="primary" 
                    variant="outlined"
                    size="small"
                  />
                  <Chip 
                    label={getRoleName(employee.role)} 
                    color="secondary" 
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
            
            {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: isMobile ? 2 : 0 }}>
              <Button variant="contained" color="primary">
                Просмотреть профиль
              </Button>
              <Button variant="outlined">
                Отправить сообщение
              </Button>
            </Box> */}
          </Paper>
          </LazyMotion>
        </Grid>
        
        {/* Навигация по вкладкам */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              borderRadius: 2,
              boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
              mb: 2
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
              <Tab label="Показатели" />
              <Tab label="Графики" />
              <Tab label="Бонусы" />
            </Tabs>
          </Paper>
        </Grid>
        
        {/* Вкладка "Обзор" */}
        {activeTab === 0 && (
          <>
            {/* Карточки с основными метриками */}
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Общая эффективность"
                value={employeeMetrics.overall_performance}
                trend={5} // Пример тренда
                description="Совокупная оценка всех показателей"
                icon="📊" // Вместо <AssessmentIcon />
                bgColor={theme.palette.primary.main}
                tooltipTitle="Общая эффективность сотрудника, рассчитанная на основе всех метрик"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="KPI"
                value={employeeMetrics.kpi}
                trend={department_comparison ? 
                  Math.round(employeeMetrics.kpi - department_comparison.kpi) : 
                  undefined
                }
                description={department_comparison ? 
                  `${Math.round(department_comparison.kpi)}% - средний KPI отдела` : 
                  "Ключевые показатели эффективности"
                }
                icon="⭐" // Вместо <StarIcon />
                bgColor={theme.palette.info.main}
                tooltipTitle="Ключевые показатели эффективности"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Объем работы"
                value={employeeMetrics.work_volume}
                trend={2} // Пример тренда
                description="Выполнение плановых объемов"
                icon="📈" // Вместо <WorkIcon />
                bgColor={theme.palette.warning.main}
                tooltipTitle="Показатель объема выполненной работы относительно плана"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Качество работы"
                value={employeeMetrics.quality}
                trend={-1} // Пример тренда
                description="Оценка качества выполненной работы"
                icon="✓" // Вместо <CheckCircleIcon />
                bgColor={theme.palette.success.main}
                tooltipTitle="Оценка качества выполняемой работы"
              />
            </Grid>
            
            {/* Дополнительные метрики */}
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Скорость"
                value={employeeMetrics.speed || '0'}
                description="Скорость выполнения задач"
                icon="⚡" // Вместо <SpeedIcon />
                bgColor={theme.palette.error.main}
                tooltipTitle="Скорость выполнения рабочих задач"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Выполнение плана"
                value={employeeMetrics.plan_completion  || '0'}
                trend={3} // Пример тренда
                description="Процент выполнения плана"
                icon="📅" // Вместо <ScheduleIcon />
                bgColor={theme.palette.secondary.main}
                tooltipTitle="Процент выполнения индивидуального плана"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Финансовые показатели"
                value={employeeMetrics.financial || 0}
                showProgress={false}
                extraValue={bonuses?.summary ? fNumber(bonuses.summary.total_confirmed) + " ₸" : "0 ₸"}
                extraLabel="Подтвержденные бонусы"
                icon="💰"
                bgColor="#6B7280"
                tooltipTitle="Финансовые показатели эффективности сотрудника"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Операционные показатели"
                value={employeeMetrics.operational || 0}
                showProgress={false}
                extraValue={bonuses?.summary ? fPercent(bonuses.summary.confirmation_rate / 100) : "0%"}
                extraLabel="Коэффициент подтверждения"
                icon="🔧"
                bgColor="#10B981"
                tooltipTitle="Операционные показатели эффективности сотрудника"
              />
            </Grid>
            
            {/* График истории метрик */}
            <Grid item xs={12}>
              <PerformanceChart
                data={chartData}
                title="История показателей"
                subheader="Изменение метрик за последний период"
              />
            </Grid>
            
            {/* Метрики специфичные для отдела */}
            <Grid item xs={12}>
              <DepartmentSpecificMetrics 
                department={employee.department} 
                metrics={employeeMetrics}
              />
            </Grid>
          </>
        )}
        
        {/* Вкладка "Показатели" */}
        {activeTab === 1 && (
          <Grid item xs={12}>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FinancialMetricsCard
                      metrics={{
                        revenue: 1200000,
                        revenue_target: 1500000,
                        margin: 72,
                        margin_target: 80,
                        growth: 8,
                        growth_target: 10
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <OperationalMetricsCard
                      metrics={{
                        timeliness: 88,
                        completion: 92,
                        efficiency: 85
                      }}
                    />
                  </Grid>
                </Grid>

          </Grid>
        )}
        
        {/* Вкладка "Графики" */}
        {activeTab === 2 && (
          <>
            <Grid item xs={12}>
              <PerformanceChart
                data={monthlyTrendData}
                title="Тренды по месяцам"
                subheader="Динамика изменения ключевых показателей по месяцам"
              />
            </Grid>
            
            <Grid item xs={12}>
              <PerformanceChart
                data={chartData}
                title="Ежедневные показатели"
                subheader="Динамика изменения метрик по дням"
              />
            </Grid>
          </>
        )}
        
        {/* Вкладка "Бонусы" */}
        {activeTab === 3 && (
          <Grid item xs={12}>
            <Card 
              sx={{ 
                borderRadius: 2,
                boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
              }}
            >
              <CardHeader 
                title="Информация о бонусах" 
                subheader={`Всего бонусов: ${bonuses?.items?.length || 0}`}
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%',
                        borderRadius: 2
                      }}
                    >
                      <CardHeader title="Сводка по бонусам" />
                      <Divider />
                      <CardContent>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Потенциальные бонусы:</Typography>
                            <Typography variant="subtitle2" fontWeight="bold">{bonuses?.summary ? fNumber(bonuses.summary.total_potential) : 0} ₸</Typography>
                          </Box>
                          <Divider />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Подтвержденные бонусы:</Typography>
                            <Typography variant="subtitle2" fontWeight="bold" color="success.main">{bonuses?.summary ? fNumber(bonuses.summary.total_confirmed) : 0} ₸</Typography>
                          </Box>
                          <Divider />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Коэффициент подтверждения:</Typography>
                            <Typography variant="subtitle2" fontWeight="bold">{bonuses?.summary ? fPercent(bonuses.summary.confirmation_rate / 100) : "0%"}</Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={8}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%',
                        borderRadius: 2
                      }}
                    >
                      <CardHeader title="Список бонусов" />
                      <Divider />
                      <CardContent>
                        {bonuses?.items && bonuses.items.length > 0 ? (
                          <Stack spacing={2}>
                            {bonuses.items.map((bonus, index) => (
                              <Box 
                                key={bonus.id || index}
                                sx={{ 
                                  p: 2, 
                                  borderRadius: 1, 
                                  border: `1px solid ${theme.palette.divider}`,
                                  bgcolor: bonus.confirmed ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.warning.main, 0.05),
                                  '&:hover': {
                                    boxShadow: theme.customShadows?.z4 || '0 4px 8px 0 rgba(145, 158, 171, 0.16)',
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="subtitle2">{bonus.description}</Typography>
                                  <Chip 
                                    label={bonus.confirmed ? 'Подтвержден' : 'Ожидает'} 
                                    color={bonus.confirmed ? 'success' : 'warning'}
                                    size="small"
                                  />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {format(new Date(bonus.date), 'dd MMMM yyyy', { locale: ru })}
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold" color={bonus.confirmed ? 'success.main' : 'warning.main'}>
                                    {fNumber(bonus.amount)} ₸
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </Stack>
                        ) : (
                          <Box sx={{ textAlign: 'center', py: 3 }}>
                            <Typography color="text.secondary">
                              Бонусы отсутствуют
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default EmployeeMetricsDashboard;