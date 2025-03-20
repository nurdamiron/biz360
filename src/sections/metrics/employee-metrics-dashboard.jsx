// Example of how to use MetricsDashboard in your EmployeeMetricsDashboard component
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
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LazyMotion, domAnimation, m } from 'framer-motion';

// Import our new components
import MetricsDashboard from './components/MetricsDashboard';
import PerformanceChart from './components/PerformanceChart';
import FinancialMetricsCard from './components/FinancialMetricsCard';
import OperationalMetricsCard from './components/OperationalMetricsCard';

export function EmployeeMetricsDashboard() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  
  // Sample employee data
  const employee = {
    name: "Иван Петров",
    department: "sales",
    role: "manager"
  };
  
  // Sample metrics data
  const metricsData = {
    overall_performance: 70,
    overall_performance_trend: 5,
    kpi: 69,
    kpi_trend: 3,
    work_volume: 65,
    work_volume_trend: 2,
    quality: 79,
    quality_trend: -1,
    speed: 63,
    plan_completion: 73,
    plan_completion_trend: 3,
    financial: 0,
    operational: 0,
    bonuses: {
      summary: {
        total_confirmed: 67426,
        total_potential: 120000,
        confirmation_rate: 50
      }
    }
  };
  
  // Sample department average
  const departmentAverage = {
    kpi: 66
  };
  
  // Sample chart data
  const chartData = [
    { date: '1 Мар', performance: 75, kpi: 72, quality: 82, work_volume: 68, speed: 71, plan_completion: 70 },
    { date: '2 Мар', performance: 73, kpi: 70, quality: 80, work_volume: 65, speed: 69, plan_completion: 68 },
    { date: '3 Мар', performance: 78, kpi: 75, quality: 85, work_volume: 70, speed: 74, plan_completion: 73 },
    { date: '4 Мар', performance: 76, kpi: 72, quality: 83, work_volume: 67, speed: 72, plan_completion: 71 },
    { date: '5 Мар', performance: 74, kpi: 71, quality: 81, work_volume: 66, speed: 70, plan_completion: 69 },
    { date: '6 Мар', performance: 77, kpi: 74, quality: 84, work_volume: 69, speed: 73, plan_completion: 72 },
    { date: '7 Мар', performance: 75, kpi: 72, quality: 82, work_volume: 68, speed: 71, plan_completion: 70 },
    { date: '8 Мар', performance: 80, kpi: 77, quality: 87, work_volume: 72, speed: 76, plan_completion: 75 },
    { date: '9 Мар', performance: 78, kpi: 75, quality: 85, work_volume: 70, speed: 74, plan_completion: 73 },
    { date: '10 Мар', performance: 76, kpi: 73, quality: 83, work_volume: 68, speed: 72, plan_completion: 71 }
  ];
  
  // Function to change active tab
  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };
  
  // Department translations
  const getDepartmentName = (code) => {
    const departments = {
      'sales': 'Отдел продаж',
      'accounting': 'Бухгалтерия',
      'logistics': 'Логистика',
      'manufacture': 'Производство'
    };
    return departments[code] || code;
  };
  
  // Role translations
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
  
  // Avatar color based on role
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
      <LazyMotion features={domAnimation}>
        <Grid container spacing={3}>
          {/* Employee Info Card */}
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
              {/* Decorative background element */}
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
            </Paper>
          </Grid>
          
          {/* Tabs Navigation */}
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
          
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Grid item xs={12} >
              {/* Our new MetricsDashboard component */}
              <MetricsDashboard 
                metrics={metricsData} 
                departmentAverage={departmentAverage}
                persistKey="employee-dashboard"
              />
              
              {/* Performance Chart */}
              <PerformanceChart
                data={chartData}
                title="История показателей"
                subheader="Изменение метрик за последний период"
                chartId="history-metrics"
              />
            </Grid>
          )}
          
          {/* Metrics Tab */}
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
          
          {/* Charts Tab */}
          {activeTab === 2 && (
            <Grid item xs={12}>
              <PerformanceChart
                data={chartData}
                title="Ежедневные показатели"
                subheader="Динамика изменения метрик по дням"
                chartId="daily-metrics"
              />
            </Grid>
          )}
          
          {/* Bonuses Tab */}
          {activeTab === 3 && (
            <Grid item xs={12}>
              {/* Bonuses content would go here */}
              <Typography variant="h6">Бонусы</Typography>
            </Grid>
          )}
        </Grid>
      </LazyMotion>
    </Container>
  );
}