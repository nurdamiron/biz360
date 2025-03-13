// src/sections/employee/employee-metrics-dashboard.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  Grid,
  Stack,
  CardHeader,
  Typography,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ApexChart } from 'src/components/chart';
import axiosInstance from 'src/lib/axios';

export function EmployeeMetricsDashboard() {
  const { id } = useParams();
  const theme = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/metrics/employee/${id}`);
        setMetrics(response.data);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Не удалось загрузить метрики. ' + (err.message || 'Неизвестная ошибка'));
      } finally {
        setLoading(false);
      }
    };
  
    if (id) {
      fetchMetrics();
    }
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!metrics) {
    return <Typography>Нет данных для отображения</Typography>;
  }

  const { employee, metrics: employeeMetrics, bonuses, history } = metrics;

  // Конфигурация для графика истории метрик
  const chartOptions = {
    chart: {
      height: 350,
      type: 'line',
      toolbar: { show: false },
    },
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    xaxis: {
      type: 'datetime',
      categories: history.map(item => item.date),
    },
    yaxis: {
      min: 0,
      max: 100,
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.error.main,
    ],
  };

  const chartSeries = [
    {
      name: 'KPI',
      data: history.map(item => item.kpi || 0),
    },
    {
      name: 'Объем работы',
      data: history.map(item => item.work_volume || 0),
    },
    {
      name: 'Активность',
      data: history.map(item => item.activity || 0),
    },
    {
      name: 'Качество',
      data: history.map(item => item.quality || 0),
    },
  ];

  return (
    <Grid container spacing={3}>
      {/* Карточки с основными метриками */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Общая эффективность" />
          <Box sx={{ p: 3, pb: 5, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <Box sx={{ position: 'relative', width: 120, height: 120, mb: 3 }}>
              <CircularProgress
                variant="determinate"
                value={employeeMetrics.overall_performance}
                size={120}
                thickness={6}
                sx={{ color: theme.palette.primary.main }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h4" component="div">
                  {Math.round(employeeMetrics.overall_performance)}%
                </Typography>
              </Box>
            </Box>
            {metrics.department_comparison && (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {employeeMetrics.overall_performance > metrics.department_comparison.overall_performance
                  ? 'Выше среднего по отделу'
                  : 'Ниже среднего по отделу'}
              </Typography>
            )}
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader title="Ключевые показатели" />
          <Stack spacing={3} sx={{ p: 3 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                KPI ({Math.round(employeeMetrics.kpi)}%)
              </Typography>
              <LinearProgress
                variant="determinate"
                value={employeeMetrics.kpi}
                color="primary"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Объем работы ({Math.round(employeeMetrics.work_volume)}%)
              </Typography>
              <LinearProgress
                variant="determinate"
                value={employeeMetrics.work_volume}
                color="info"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Активность ({Math.round(employeeMetrics.activity)}%)
              </Typography>
              <LinearProgress
                variant="determinate"
                value={employeeMetrics.activity}
                color="warning"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Качество ({Math.round(employeeMetrics.quality)}%)
              </Typography>
              <LinearProgress
                variant="determinate"
                value={employeeMetrics.quality}
                color="error"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Stack>
        </Card>
      </Grid>

      {/* График истории метрик */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title="История показателей" />
          <Box sx={{ p: 3, pb: 1 }}>
            <ApexChart
              type="line"
              series={chartSeries}
              options={chartOptions}
              height={350}
            />
          </Box>
        </Card>
      </Grid>

      {/* Информация о бонусах */}
      {bonuses && (
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Бонусы" />
            <Stack spacing={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Потенциальные бонусы:</Typography>
                <Typography variant="subtitle2">{bonuses.summary.total_potential.toFixed(2)} ₽</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Подтвержденные бонусы:</Typography>
                <Typography variant="subtitle2">{bonuses.summary.total_confirmed.toFixed(2)} ₽</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Коэффициент подтверждения:</Typography>
                <Typography variant="subtitle2">{bonuses.summary.confirmation_rate.toFixed(2)}%</Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}