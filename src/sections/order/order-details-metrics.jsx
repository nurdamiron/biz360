// src/sections/order/order-details-metrics.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  Typography,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ApexChart } from 'src/components/chart';
import axiosInstance from 'src/lib/axios';

export function OrderDetailsMetrics({ orderId }) {
  const theme = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/orders/${orderId}/metrics`);
        setMetrics(response.data);
      } catch (err) {
        console.error('Error fetching order metrics:', err);
        setError('Не удалось загрузить метрики заказа');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchMetrics();
    }
  }, [orderId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!metrics) {
    return (
      <Box p={3}>
        <Typography color="text.secondary">Нет данных по метрикам</Typography>
      </Box>
    );
  }

  // Создаем данные для графика времени по статусам
  const statusLabels = Object.keys(metrics.status_durations);
  const statusDurations = Object.values(metrics.status_durations).map(duration => 
    parseFloat(duration).toFixed(2)
  );

  const chartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
      },
    },
    xaxis: {
      categories: statusLabels.map(status => status),
    },
    yaxis: {
      title: {
        text: 'Время (часы)',
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} часов`,
      },
    },
    colors: [theme.palette.primary.main],
  };

  const chartSeries = [
    {
      name: 'Время',
      data: statusDurations,
    },
  ];

  return (
    <Card>
      <CardHeader title="Метрики заказа" />
      <Divider />
      <Box p={3}>
        <Typography variant="subtitle1" gutterBottom>
          Общая статистика времени обработки
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Общее время обработки заказа" 
              secondary={`${parseFloat(metrics.total_processing_time).toFixed(2)} часов`} 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Текущий статус" 
              secondary={metrics.current_status} 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Время в текущем статусе" 
              secondary={`${parseFloat(metrics.current_status_duration).toFixed(2)} часов`} 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Количество изменений статуса" 
              secondary={metrics.total_changes} 
            />
          </ListItem>
        </List>

        <Typography variant="subtitle1" gutterBottom mt={3}>
          Время по отделам
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Отдел продаж" 
              secondary={`${parseFloat(metrics.department_durations.sales).toFixed(2)} часов`} 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Бухгалтерия" 
              secondary={`${parseFloat(metrics.department_durations.accounting).toFixed(2)} часов`} 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Логистика" 
              secondary={`${parseFloat(metrics.department_durations.logistics).toFixed(2)} часов`} 
            />
          </ListItem>
        </List>

        <Typography variant="subtitle1" gutterBottom mt={3}>
          Время по статусам
        </Typography>
        <Box height={350} mt={2}>
          <ApexChart
            type="bar"
            series={chartSeries}
            options={chartOptions}
            height={350}
          />
        </Box>
      </Box>
    </Card>
  );
}