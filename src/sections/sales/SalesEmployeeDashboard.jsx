// src/sections/sales/SalesEmployeeDashboard.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Tabs,
  Tab,
  Container,
  alpha,
  Card,
  Stack,
  LinearProgress,
  Alert,
  Chip,
  Avatar,
  Button,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Импорт компонентов отдела продаж
import { 
  ClientsList, 
  SalesPerformance,
  PotentialBonuses,
  DevelopmentPlan,
  LeadInteractionTracker,
  ClientHistoryTable,
  ClientDetailsCard,
  CallHistoryTable,
  SalesPlanDashboard,
  // Новые компоненты распределения лидов
  LeadDistributionBoard,
  leadDistributionService,
  initializeSmartDistribution
} from './components';

// Импорт хуков данных
import { useEmployeeData } from 'src/hooks/use-employee-data';
import { useEmployeeMetrics } from 'src/hooks/use-employee-metrics';
import { useSalesData } from 'src/hooks/use-sales-data';
import { useClientHistory } from 'src/hooks/useClientHistory';
import { useSalesPlans } from 'src/hooks/useSalesPlans';

// Заглушки для иконок
const Icons = {
  Dashboard: '📊',
  Clients: '👥',
  Performance: '📈',
  Development: '📝',
  Bonuses: '💰',
  History: '📋',
  Calls: '📞',
  Plans: '🎯',
  Distribution: '🔄',
  Interactions: '🤝',
};

export function SalesEmployeeDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  
  // Получаем данные сотрудника и метрики
  const { employeeData } = useEmployeeData();
  const { metrics, loading, error } = useEmployeeMetrics();
  const { 
    data: salesData,
    loading: loadingSalesData,
    error: salesError,
    activeClients,
    completedDeals,
    newAssignments,
    salesPerformance,
    improvements,
    chartData
  } = useSalesData({ fetchOnMount: true });
  
  // Использование хуков для истории и планов
  const { 
    clients,
    calls,
    loading: loadingHistory,
    error: historyError,
    getClientById,
    selectClient
  } = useClientHistory({ fetchOnMount: true });
  
  const {
    salesPlans,
    loading: loadingPlans,
    error: plansError
  } = useSalesPlans({ fetchOnMount: true });
  
  // Обработчик переключения вкладок
  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };
  
  // Обработчик открытия деталей клиента
  const handleOpenClientDetails = (clientId) => {
    setSelectedClientId(clientId);
    selectClient(clientId);
    setClientDetailsOpen(true);
  };
  
  // Обработчик закрытия деталей клиента
  const handleCloseClientDetails = () => {
    setClientDetailsOpen(false);
  };
  
  // Обработчик звонка клиенту
  const handleCallClient = (clientId) => {
    console.log('Звонок клиенту:', clientId);
    // Будет реализована функциональность звонка
  };
  
  // Обработчик отправки email клиенту
  const handleEmailClient = (clientId) => {
    console.log('Отправка email клиенту:', clientId);
    // Будет реализована функциональность отправки email
  };
  
  // Обработчик редактирования клиента
  const handleEditClient = (clientId) => {
    console.log('Редактирование клиента:', clientId);
    // Будет реализована функциональность редактирования
  };
  
  // Получение цвета для аватара на основе роли
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
  
  // Получение русского названия роли
  const getRoleName = (role) => {
    const roles = {
      'owner': 'Владелец',
      'admin': 'Администратор',
      'head': 'Руководитель',
      'manager': 'Менеджер',
      'employee': 'Сотрудник'
    };
    return roles[role] || role;
  };
  
  const handleRefreshData = () => {
    // Add your refresh logic here, e.g.:
    // fetchLeadDistributionData();
    console.log('Refreshing lead distribution data');
  };
  
  // Данные метрик (используем мок-данные, если нет настоящих)
  const metricsData = metrics || {
    overall_performance: 70,
    overall_performance_trend: 5,
    kpi: 69,
    kpi_trend: 3,
    work_volume: 65,
    work_volume_trend: 2,
    quality: 79,
    quality_trend: -1,
    speed: 63,
    speed_trend: 0,
    plan_completion: 73,
    plan_completion_trend: 3,
    bonuses: {
      summary: {
        total_confirmed: 45000,
        total_potential: 78000,
        confirmation_rate: 58
      },
      list: [
        { id: 1, client: 'ООО "Технопром"', status: 'В процессе', amount: 31500, probability: 65 },
        { id: 2, client: 'ИП Иванов', status: 'Первый контакт', amount: 8400, probability: 25 },
        { id: 3, client: 'АО "СтройИнвест"', status: 'Согласование', amount: 46800, probability: 40 }
      ]
    }
  };
  
  // Данные сотрудника (используем мок-данные, если нет настоящих)
  const employee = employeeData || {
    id: '12345',
    name: "Иван Петров",
    department: "sales",
    role: "manager",
    level: "Middle",
    progress_to_next_level: 68,
    next_level: "Senior",
    competencies: {
      product_knowledge: 82,
      sales_skills: 78,
      objection_handling: 75,
      documentation: 90
    },
    development_plan: {
      required_courses: [
        { id: 1, title: "Продвинутые техники работы с возражениями", duration: 2, completed: false },
        { id: 2, title: "Ускорение цикла сделки", duration: 1.5, completed: false },
        { id: 3, title: "Кросс-продажи и допродажи", duration: 2, completed: false }
      ],
      completed_courses: 5,
      total_courses: 12
    }
  };
  
  const isLoading = loading || loadingSalesData || loadingHistory || loadingPlans;
  const hasError = error || salesError || historyError || plansError;
  
  if (isLoading && !employee) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ my: 5, display: 'flex', justifyContent: 'center' }}>
          <LinearProgress sx={{ width: '100%' }} />
        </Box>
      </Container>
    );
  }
  
  if (hasError) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 3 }}>
          {error || salesError || historyError || plansError}
        </Alert>
      </Container>
    );
  }
  
  // Проверяем, что employee и employee.name определены
  const employeeName = employee?.name || 'Сотрудник';
  const employeeRole = employee?.role || 'employee';
  const employeeLevel = employee?.level || 'Junior';
  const employeeNextLevel = employee?.next_level || 'Middle';
  const employeeProgress = employee?.progress_to_next_level || 0;
  
  // Получаем выбранного клиента
  const selectedClient = getClientById(selectedClientId);
  
  return (
    <Container maxWidth="xl">
      <LazyMotion features={domAnimation}>
        <Grid container spacing={3}>
          {/* Информация о сотруднике */}
          <Grid item xs={12}>
            <Card
              component={m.div}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              sx={{
                p: 3,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                borderRadius: 2,
                boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Декоративный фоновый элемент */}
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
                    bgcolor: getAvatarColor(employeeRole),
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    boxShadow: `0 0 0 4px ${alpha(getAvatarColor(employeeRole), 0.2)}`
                  }}
                >
                  {employeeName.charAt(0)}
                </Avatar>
                
                <Box>
                  <Typography variant="h4" gutterBottom fontWeight="bold">
                    {employeeName}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label="Отдел продаж" 
                      color="primary" 
                      variant="outlined"
                      size="small"
                    />
                    <Chip 
                      label={getRoleName(employeeRole)} 
                      color="secondary" 
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">
                    Текущий уровень: 
                    <Typography component="span" fontWeight="bold" color="primary.main" sx={{ pl: 0.5 }}>
                      {employeeLevel}
                    </Typography>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Прогресс до {employeeNextLevel}:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      {employeeProgress}%
                    </Typography>
                  </Box>
                </Box>
                
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/dashboard/development')}
                >
                  План развития
                </Button>
              </Box>
            </Card>
          </Grid>
          
          {/* Навигация по вкладкам */}
          <Grid item xs={12}>
            <Card 
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
                <Tab 
                  label="Обзор" 
                  icon={Icons.Dashboard}
                  iconPosition="start"
                />
                <Tab 
                  label="Мои клиенты" 
                  icon={Icons.Clients}
                  iconPosition="start"
                />
                <Tab 
                  label="Эффективность" 
                  icon={Icons.Performance}
                  iconPosition="start"
                />
                <Tab 
                  label="Развитие" 
                  icon={Icons.Development}
                  iconPosition="start"
                />
                <Tab 
                  label="Бонусы" 
                  icon={Icons.Bonuses}
                  iconPosition="start"
                />
                <Tab 
                  label="История клиентов" 
                  icon={Icons.History}
                  iconPosition="start"
                />
                <Tab 
                  label="Звонки" 
                  icon={Icons.Calls}
                  iconPosition="start"
                />
                <Tab 
                  label="Планы продаж" 
                  icon={Icons.Plans}
                  iconPosition="start"
                />
                {/* Новая вкладка для распределения лидов */}
                <Tab 
                  label="Распределение лидов" 
                  icon={Icons.Distribution}
                  iconPosition="start"
                />
                <Tab 
                  label="Взаимодействия" 
                  icon={Icons.Interactions}
                  iconPosition="start"
                />
              </Tabs>
            </Card>
          </Grid>
          
          {/* Вкладка "Обзор" */}
          {activeTab === 0 && (
            <>
              {/* Основные метрики */}
              <Grid item xs={12} md={4}>
                <MetricCard
                  title="Общая эффективность"
                  value={metricsData.overall_performance}
                  trend={metricsData.overall_performance_trend}
                  description="Совокупная оценка всех показателей"
                  icon="📊"
                  bgColor={theme.palette.primary.main}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <MetricCard
                  title="KPI"
                  value={metricsData.kpi}
                  trend={metricsData.kpi_trend}
                  description="Ключевые показатели эффективности"
                  icon="⭐"
                  bgColor={theme.palette.info.main}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <MetricCard
                  title="Объем работы"
                  value={metricsData.work_volume}
                  trend={metricsData.work_volume_trend}
                  description="Выполнение плановых объемов"
                  icon="📈"
                  bgColor={theme.palette.warning.main}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <MetricCard
                  title="Качество работы"
                  value={metricsData.quality}
                  trend={metricsData.quality_trend}
                  description="Оценка качества выполненной работы"
                  icon="✓"
                  bgColor={theme.palette.success.main}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <MetricCard
                  title="Скорость"
                  value={metricsData.speed}
                  trend={metricsData.speed_trend}
                  description="Скорость выполнения задач"
                  icon="⚡"
                  bgColor={theme.palette.error.main}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <MetricCard
                  title="Выполнение плана"
                  value={metricsData.plan_completion}
                  trend={metricsData.plan_completion_trend}
                  description="Процент выполнения плана"
                  icon="📅"
                  bgColor={theme.palette.secondary.main}
                />
              </Grid>
              
              {/* График производительности */}
              <Grid item xs={12}>
                <PerformanceChart
                  data={chartData}
                  title="История показателей"
                  subheader="Изменение метрик за последний период"
                  chartId="sales-employee-performance"
                />
              </Grid>
              
              {/* Блок "Моя нагрузка" */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
                    height: '100%'
                  }}
                >
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Моя нагрузка
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Текущая загрузка и оптимальные значения
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="h5" gutterBottom>
                          7/10 активных сделок
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Оптимальная загрузка: 8-10 сделок
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={70}
                          sx={{ 
                            mt: 1, 
                            height: 10, 
                            borderRadius: 5,
                            bgcolor: alpha(theme.palette.info.main, 0.15),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: theme.palette.info.main
                            }
                          }}
                        />
                      </Box>
                      
                      <Box>
                        <Typography variant="body1" gutterBottom fontWeight="medium">
                          Сложность текущих проектов: 
                          <Typography component="span" fontWeight="bold" sx={{ pl: 0.5 }}>
                            Средняя (коэффициент 1.2)
                          </Typography>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Влияет на расчет бонусов и оптимальную загрузку
                        </Typography>
                      </Box>
                      
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Рекомендуется взять в работу еще 1-2 клиента для оптимальной загрузки
                      </Alert>
                    </Stack>
                  </Box>
                </Card>
              </Grid>
              
              {/* Блок "Потенциальные бонусы" */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
                    height: '100%'
                  }}
                >
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Потенциальные бонусы
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Текущие и прогнозируемые бонусы
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="body1" gutterBottom fontWeight="medium">
                          Подтвержденные бонусы:
                        </Typography>
                        <Typography variant="h5" color="success.main" fontWeight="bold">
                          {metricsData.bonuses.summary.total_confirmed.toLocaleString()} ₸
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body1" gutterBottom fontWeight="medium">
                          Потенциальные бонусы:
                        </Typography>
                        <Typography variant="h5" color="warning.main" fontWeight="bold">
                          {metricsData.bonuses.summary.total_potential.toLocaleString()} ₸
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Зависят от закрытия текущих сделок
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body1" gutterBottom fontWeight="medium">
                          Прогнозируемый бонус месяца:
                        </Typography>
                        <Typography variant="h5" color="primary.main" fontWeight="bold">
                          {(metricsData.bonuses.summary.total_confirmed + metricsData.bonuses.summary.total_potential).toLocaleString()} ₸
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          При выполнении текущего плана продаж
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            </>
          )}
          
          {/* Вкладка "Мои клиенты" */}
          {activeTab === 1 && (
            <Grid item xs={12}>
              <ClientsList 
                activeClients={activeClients} 
                completedDeals={completedDeals} 
                newAssignments={newAssignments}
              />
            </Grid>
          )}
          
          {/* Вкладка "Эффективность" */}
          {activeTab === 2 && (
            <Grid item xs={12}>
              <SalesPerformance 
                salesData={salesPerformance}
                improvements={improvements}
              />
            </Grid>
          )}
          
          {/* Вкладка "Развитие" */}
          {activeTab === 3 && (
            <Grid item xs={12}>
              <DevelopmentPlan 
                employee={employee}
              />
            </Grid>
          )}
          
          {/* Вкладка "Бонусы" */}
          {activeTab === 4 && (
            <Grid item xs={12}>
              <PotentialBonuses 
                bonuses={metricsData.bonuses}
              />
            </Grid>
          )}
          
          {/* Вкладка "История клиентов" */}
          {activeTab === 5 && (
            <Grid item xs={12}>
              <ClientHistoryTable 
                clients={clients}
                onViewDetails={handleOpenClientDetails}
                onCallClient={handleCallClient}
                onEmailClient={handleEmailClient}
                onEditClient={handleEditClient}
              />
              
              <ClientDetailsCard
                client={selectedClient}
                open={clientDetailsOpen}
                onClose={handleCloseClientDetails}
              />
            </Grid>
          )}
          
          {/* Вкладка "Звонки" */}
          {activeTab === 6 && (
            <Grid item xs={12}>
              <CallHistoryTable 
                calls={calls}
                isLoading={loadingHistory}
              />
            </Grid>
          )}
          
          {/* Вкладка "Планы продаж" */}
          {activeTab === 7 && (
            <Grid item xs={12}>
              <SalesPlanDashboard salesPlans={salesPlans || {}} />
            </Grid>
          )}
          
          {/* Новая вкладка "Распределение лидов" */}
          {activeTab === 8 && (
            <Grid item xs={12}>
              <LeadDistributionBoard 
                onRefreshData={handleRefreshData}
              />
            </Grid>
          )}
          
          {/* Вкладка "Взаимодействия с лидами" */}
          {activeTab === 9 && (
            <Grid item xs={12}>
              <LeadInteractionTracker 
                interactions={salesData?.leadInteractions || []}
                isLoading={isLoading}
              />
            </Grid>
          )}
        </Grid>
      </LazyMotion>
    </Container>
  );
}

// Компонент метрики для обзора
const MetricCard = ({ title, value, trend, description, icon, bgColor }) => {
  const theme = useTheme();
  
  return (
    <Card
      component={m.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        borderRadius: 2,
        boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
        height: '100%',
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.customShadows?.z16 || '0 12px 24px 0 rgba(145, 158, 171, 0.24)'
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, mb: 0.5 }} fontWeight="bold">
              {value}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip 
                label={`${trend > 0 ? '+' : ''}${trend}%`}
                size="small"
                color={trend >= 0 ? 'success' : 'error'}
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
              <Typography variant="caption" color="text.secondary">
                {description}
              </Typography>
            </Stack>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: alpha(bgColor, 0.1),
              color: bgColor,
              fontSize: '1.5rem'
            }}
          >
            {icon}
          </Box>
        </Stack>
      </Box>
    </Card>
  );
};

// Компонент графика производительности
const PerformanceChart = ({ data, title, subheader, chartId }) => {
  const theme = useTheme();
  
  return (
    <Card
      component={m.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      sx={{ 
        borderRadius: 2,
        boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)'
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary">{subheader}</Typography>
        <Box sx={{ height: 360, mt: 3 }}>
          {/* В реальной имплементации здесь будет компонент графика */}
          <Alert severity="info">
            Здесь будет отображаться динамический график с метриками производительности
          </Alert>
        </Box>
      </Box>
    </Card>
  );
};