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
  Paper,
  Grid,
  Stack,
  Alert,
  Tab,
  Tabs
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ApexChart } from 'src/components/chart';
import axiosInstance from 'src/lib/axios';
import { fCurrency } from 'src/utils/format-number';
import { fDate, fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';

export function OrderDetailsMetrics({ orderId }) {
  const theme = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [bonusData, setBonusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch order metrics
        const metricsResponse = await axiosInstance.get(`/api/orders/${orderId}/metrics`);
        setMetrics(metricsResponse.data);
        
        // Fetch bonus data for this order
        try {
          const bonusResponse = await axiosInstance.get(`/api/orders/${orderId}/bonuses`);
          setBonusData(bonusResponse.data);
        } catch (bonusError) {
          console.error('Error fetching bonus data:', bonusError);
          // We continue even if bonus data fails to load
        }
      } catch (err) {
        console.error('Error fetching order metrics:', err);
        setError('Не удалось загрузить метрики заказа');
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchData();
    }
  }, [orderId]);
  
  if (loading) {
    return (
      <Card>
        <CardHeader title="Метрики заказа" />
        <Box display="flex" justifyContent="center" alignItems="center" p={5}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader title="Метрики заказа" />
        <Box p={3}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Card>
    );
  }
  
  if (!metrics) {
    return (
      <Card>
        <CardHeader title="Метрики заказа" />
        <Box p={3}>
          <Alert severity="info">Нет данных по метрикам для этого заказа</Alert>
        </Box>
      </Card>
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
  
  // Prepare data for the department chart
  const departmentChartOptions = {
    chart: {
      type: 'pie',
      toolbar: { show: false },
    },
    labels: Object.keys(metrics.department_durations),
    tooltip: {
      y: {
        formatter: (val) => `${parseFloat(val).toFixed(2)} часов`,
      },
    },
    legend: {
      position: 'bottom',
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main
    ],
  };
  
  const departmentChartSeries = Object.values(metrics.department_durations).map(val => 
    parseFloat(val).toFixed(2)
  );
  
  // Render the processing time metrics tab
  const renderProcessingTimeTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
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
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
          <Typography variant="subtitle1" gutterBottom>
            Время по отделам
          </Typography>
          <Box height={250}>
            <ApexChart
              type="pie"
              series={departmentChartSeries}
              options={departmentChartOptions}
              height="100%"
            />
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" gutterBottom>
            Время по статусам
          </Typography>
          <Box height={350}>
            <ApexChart
              type="bar"
              series={chartSeries}
              options={chartOptions}
              height="100%"
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
  
  // Render the bonus data tab
  const renderBonusTab = () => {
    if (!bonusData) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Данные о бонусах недоступны или еще не рассчитаны
        </Alert>
      );
    }
    
    return (
      <Grid container spacing={3}>
        {/* Summary card */}
        <Grid item xs={12} md={4}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2.5, 
              height: '100%',
              borderColor: bonusData.confirmed ? 'success.main' : 'warning.main',
              bgcolor: bonusData.confirmed ? `${theme.palette.success.main}10` : `${theme.palette.warning.main}10`,
            }}
          >
            <Stack spacing={2} alignItems="center" justifyContent="center" height="100%">
              <Typography variant="subtitle1">
                {bonusData.confirmed ? 'Подтвержденный бонус' : 'Потенциальный бонус'}
              </Typography>
              
              <Typography variant="h3" color={bonusData.confirmed ? 'success.main' : 'warning.main'}>
                {fCurrency(bonusData.amount)}
              </Typography>
              
              <Box 
                sx={{ 
                  p: 1,
                  borderRadius: 1,
                  bgcolor: bonusData.confirmed ? 'success.lighter' : 'warning.lighter',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Iconify 
                  icon={bonusData.confirmed ? "eva:checkmark-circle-2-fill" : "eva:clock-outline"} 
                  width={20} 
                  color={bonusData.confirmed ? 'success.main' : 'warning.main'} 
                />
                <Typography variant="caption" color={bonusData.confirmed ? 'success.main' : 'warning.main'}>
                  {bonusData.confirmed 
                    ? `Подтвержден ${bonusData.confirmed_at ? fDate(bonusData.confirmed_at) : ''}` 
                    : 'Ожидает подтверждения'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        
        {/* Bonus details */}
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Детали бонуса
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Базовая ставка бонуса" 
                  secondary={`${bonusData.bonus_percent || 5}%`} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Общая сумма заказа" 
                  secondary={fCurrency(bonusData.order_total || 0)} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Общая маржа" 
                  secondary={fCurrency(bonusData.total_margin || 0)} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Средний процент маржи" 
                  secondary={`${parseFloat(bonusData.margin_percentage || 0).toFixed(2)}%`} 
                />
              </ListItem>
              
              {bonusData.confirmed && (
                <ListItem>
                  <ListItemText 
                    primary="Дата утверждения бонуса" 
                    secondary={bonusData.confirmed_at ? fDateTime(bonusData.confirmed_at) : '-'} 
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        {/* Bonus items */}
        {bonusData.items && bonusData.items.length > 0 && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" gutterBottom>
                Бонусы по товарам
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {bonusData.items.map((item, index) => (
                <Box key={index}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                      <Typography variant="body2" fontWeight="bold">
                        {item.product_name || `Товар ${index + 1}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Кол-во: {item.quantity} × {fCurrency(item.unit_price)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Базовая цена: {fCurrency(item.base_price)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Маржа: {fCurrency((item.unit_price - item.base_price) * item.quantity)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6} md={2}>
                      <Typography variant="body2" color="text.secondary">
                        Наценка: {parseFloat(item.margin_percentage || 0).toFixed(2)}%
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={2}>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        Бонус: {fCurrency(item.bonus_amount)}
                      </Typography>
                    </Grid>
                  </Grid>
                  {index < bonusData.items.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              ))}
            </Paper>
          </Grid>
        )}
        
        {/* Bonus rules */}
        {bonusData.rules && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" gutterBottom>
                Правила начисления бонусов
              </Typography>
              
              <List>
                {bonusData.rules.map((rule, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={rule} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        )}
      </Grid>
    );
  };
  
  // Render the employee metrics impact tab
  const renderMetricsImpactTab = () => {
    if (!metrics.employee_impact) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Данные о влиянии на метрики сотрудника недоступны
        </Alert>
      );
    }
    
    const impact = metrics.employee_impact;
    
    // Prepare chart for metrics comparison
    const impactChartOptions = {
      chart: {
        type: 'bar',
        stacked: false,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 2,
        },
      },
      xaxis: {
        categories: ['KPI', 'Эффективность', 'Объем работы', 'Активность'],
      },
      colors: [theme.palette.primary.main, theme.palette.success.main],
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(1)}`,
      },
      tooltip: {
        shared: true,
        intersect: false,
      },
    };
    
    const impactChartSeries = [
      {
        name: 'До',
        data: [
          impact.before?.kpi || 0,
          impact.before?.overall_performance || 0,
          impact.before?.work_volume || 0,
          impact.before?.activity || 0,
        ],
      },
      {
        name: 'После',
        data: [
          impact.after?.kpi || 0,
          impact.after?.overall_performance || 0,
          impact.after?.work_volume || 0,
          impact.after?.activity || 0,
        ],
      },
    ];
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Влияние на сотрудника
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Сотрудник" 
                  secondary={impact.employee_name || 'Нет данных'} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Изменение KPI" 
                  secondary={
                    <Typography 
                      variant="body2" 
                      color={impact.changes?.kpi > 0 ? 'success.main' : 'text.secondary'}
                    >
                      {impact.changes?.kpi > 0 ? '+' : ''}{parseFloat(impact.changes?.kpi || 0).toFixed(2)}
                    </Typography>
                  } 
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Изменение эффективности" 
                  secondary={
                    <Typography 
                      variant="body2" 
                      color={impact.changes?.overall_performance > 0 ? 'success.main' : 'text.secondary'}
                    >
                      {impact.changes?.overall_performance > 0 ? '+' : ''}{parseFloat(impact.changes?.overall_performance || 0).toFixed(2)}
                    </Typography>
                  } 
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Дата обновления метрик" 
                  secondary={impact.updated_at ? fDateTime(impact.updated_at) : 'Нет данных'} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Сравнение метрик до и после
            </Typography>
            
            <Box height={280}>
              <ApexChart
                type="bar"
                series={impactChartSeries}
                options={impactChartOptions}
                height="100%"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };
  
  return (
    <Card>
      <CardHeader title="Метрики заказа" />
      <Divider />
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ px: 3 }}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Время обработки" />
        <Tab label="Бонусы" />
        <Tab label="Влияние на метрики" />
      </Tabs>
      
      <Box p={3}>
        {activeTab === 0 && renderProcessingTimeTab()}
        {activeTab === 1 && renderBonusTab()}
        {activeTab === 2 && renderMetricsImpactTab()}
      </Box>
    </Card>
  );
}