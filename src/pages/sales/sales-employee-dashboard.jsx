// src/sections/sales/SalesEmployeeDashboard.jsx
import { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Avatar,
  Chip,
  Typography,
  Tabs,
  Tab,
  Container,
  alpha,
  Button,
  Divider,
  Stack,
  IconButton,
  LinearProgress,
  CardHeader, // Correct Latin 'C'
  CardContent,
  Card,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Импорт компонентов метрик
import { 
  MetricCard, 
  PerformanceChart, 
} from '../../sections/metrics/components';

// Импорт компонентов отдела продаж
import { 
  ClientsList,
  SalesPerformance,
  PotentialBonuses,
  DevelopmentPlan
} from '../../sections/sales/components';

export function SalesEmployeeDashboard({ 
  employeeData,
  metrics,
  activeClients,
  completedDeals,
  salesPerformance,
  improvements,
  chartData
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  
  // Обработчик переключения вкладок
  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
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
  
  // Данные метрик (используем переданные данные)
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
      list: []
    }
  };
  
  // Данные сотрудника (используем переданные данные)
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
  
  // Проверяем, что employee и employee.name определены
  const employeeName = employee?.name || 'Сотрудник';
  const employeeRole = employee?.role || 'employee';
  const employeeLevel = employee?.level || 'Junior';
  const employeeNextLevel = employee?.next_level || 'Middle';
  const employeeProgress = employee?.progress_to_next_level || 0;
  
  return (
    <Container maxWidth="xl">
      <LazyMotion features={domAnimation}>
        <Grid container spacing={3}>
          {/* Информация о сотруднике */}
          <Grid item xs={12}>
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
                  onClick={() => navigate('/dashboard/sales/development')}
                >
                  План развития
                </Button>
              </Box>
            </Paper>
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
                <Tab label="Мои клиенты" />
                <Tab label="Эффективность" />
                <Tab label="Развитие" />
                <Tab label="Бонусы" />
              </Tabs>
            </Paper>
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
                  description="Выполнение плановых задач"
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
                  data={chartData || []}
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
                  <CardHeader 
                    title="Моя нагрузка" 
                    subheader="Текущая загрузка и оптимальные значения"
                  />
                  <Divider />
                  <CardContent>
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="h5" gutterBottom>
                          {activeClients?.length || 0}/10 активных сделок
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Оптимальная загрузка: 8-10 сделок
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(((activeClients?.length || 0) / 10) * 100, 100)}
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
                  </CardContent>
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
                  <CardHeader 
                    title="Потенциальные бонусы" 
                    subheader="Текущие и прогнозируемые бонусы"
                  />
                  <Divider />
                  <CardContent>
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="body1" gutterBottom fontWeight="medium">
                          Подтвержденные бонусы:
                        </Typography>
                        <Typography variant="h5" color="success.main" fontWeight="bold">
                          {metricsData.bonuses?.summary?.total_confirmed?.toLocaleString()} ₸
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body1" gutterBottom fontWeight="medium">
                          Потенциальные бонусы:
                        </Typography>
                        <Typography variant="h5" color="warning.main" fontWeight="bold">
                          {metricsData.bonuses?.summary?.total_potential?.toLocaleString()} ₸
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
                          {((metricsData.bonuses?.summary?.total_confirmed || 0) + 
                            (metricsData.bonuses?.summary?.total_potential || 0)).toLocaleString()} ₸
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          При выполнении текущего плана продаж
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
          
          {/* Вкладка "Мои клиенты" */}
          {activeTab === 1 && (
            <Grid item xs={12}>
              <ClientsList 
                activeClients={activeClients || []} 
                completedDeals={completedDeals || []} 
              />
            </Grid>
          )}
          
          {/* Вкладка "Эффективность" */}
          {activeTab === 2 && (
            <Grid item xs={12}>
              <SalesPerformance 
                salesData={salesPerformance || {}}
                improvements={improvements || []}
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
        </Grid>
      </LazyMotion>
    </Container>
  );
}

// Экспорт компонента по умолчанию
export default SalesEmployeeDashboard;