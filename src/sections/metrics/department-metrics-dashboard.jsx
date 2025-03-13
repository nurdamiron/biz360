// src/sections/metrics/department-metrics-dashboard.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  Grid,
  Table,
  Stack,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  CardHeader,
  Typography,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ApexChart } from 'src/components/chart';
import axiosInstance from 'src/lib/axios';

export function DepartmentMetricsDashboard() {
  const { department } = useParams();
  const theme = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/metrics/department/${department}`);
        setMetrics(response.data);
      } catch (err) {
        console.error('Error fetching department metrics:', err);
        setError('Не удалось загрузить метрики отдела');
      } finally {
        setLoading(false);
      }
    };

    if (department) {
      fetchMetrics();
    }
  }, [department]);

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

  const { metrics: departmentMetrics, employees } = metrics;

  // Конфигурация для графика распределения KPI
  const distributionOptions = {
    chart: {
      height: 350,
      type: 'bar',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
      },
    },
    xaxis: {
      categories: employees.map(emp => emp.name),
      max: 100,
    },
    colors: [theme.palette.primary.main],
  };

  const distributionSeries = [
    {
      name: 'KPI',
      data: employees.map(emp => emp.metrics.kpi || 0),
    },
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Средние показатели отдела" />
          <Stack spacing={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Общая эффективность:</Typography>
              <Typography variant="subtitle2">{Math.round(departmentMetrics.averages.overall_performance)}%</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">KPI:</Typography>
              <Typography variant="subtitle2">{Math.round(departmentMetrics.averages.kpi)}%</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Объем работы:</Typography>
              <Typography variant="subtitle2">{Math.round(departmentMetrics.averages.work_volume)}%</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Активность:</Typography>
              <Typography variant="subtitle2">{Math.round(departmentMetrics.averages.activity)}%</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Качество:</Typography>
              <Typography variant="subtitle2">{Math.round(departmentMetrics.averages.quality)}%</Typography>
            </Box>
          </Stack>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader title="Распределение KPI по сотрудникам" />
          <Box sx={{ p: 3, pb: 1 }}>
            <ApexChart
              type="bar"
              series={distributionSeries}
              options={distributionOptions}
              height={350}
            />
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader title="Сотрудники отдела" />
          <Box sx={{ p: 1 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Сотрудник</TableCell>
                  <TableCell align="center">Общая эффективность</TableCell>
                  <TableCell align="center">KPI</TableCell>
                  <TableCell align="center">Объем работы</TableCell>
                  <TableCell align="center">Активность</TableCell>
                  <TableCell align="center">Качество</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }} />
                        <Typography variant="body2">{employee.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">{Math.round(employee.metrics.overall_performance)}%</TableCell>
                    <TableCell align="center">{Math.round(employee.metrics.kpi)}%</TableCell>
                    <TableCell align="center">{Math.round(employee.metrics.work_volume)}%</TableCell>
                    <TableCell align="center">{Math.round(employee.metrics.activity)}%</TableCell>
                    <TableCell align="center">{Math.round(employee.metrics.quality)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}