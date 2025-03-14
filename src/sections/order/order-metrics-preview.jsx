// src/sections/order/OrderMetricsPreview.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  LinearProgress,
  Divider,
  Alert,
  Paper,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ApexChart } from 'src/components/chart';
import { useFormContext } from 'react-hook-form';
import { 
  calculateItemBonusAndMargin, 
  simulateMetricsImpact,
  BASE_BONUS_PERCENTAGE 
} from 'src/utils/bonusCalculator';

export function OrderMetricsPreview({ totalBonus, avgMargin }) {
  const theme = useTheme();
  const { watch } = useFormContext();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  
  // Get relevant fields from the form
  const items = watch('items') || [];
  const billing_to = watch('billing_to');
  const total = watch('total') || 0;
  
  // Form validation status
  const isValid = items.length > 0 && 
                 items.every(item => item.title && item.quantity > 0 && item.unit_price > 0) &&
                 billing_to;
  
  // Function to calculate total bonus from items using the correct formula
  const calculateTotalBonus = useCallback(() => {
    let calculatedTotalBonus = 0;
    let totalMarginPercentage = 0;
    let validItemsCount = 0;
    
    items.forEach(item => {
      // Check for all required data
      if (item && item.base_price && item.unit_price && item.quantity) {
        // Calculate using the correct formula:
        // 1. Base bonus = basePrice * 5%
        // 2. Adjusted bonus = baseBonus * (sellingPrice / basePrice)
        // 3. Total bonus = adjustedBonus * quantity
        const basePrice = Number(item.base_price);
        const sellingPrice = Number(item.unit_price);
        const quantity = Number(item.quantity);
        
        const baseBonus = basePrice * (BASE_BONUS_PERCENTAGE / 100);
        const adjustedBonus = baseBonus * (sellingPrice / basePrice);
        const itemBonus = Math.round(adjustedBonus * quantity);
        
        // Calculate margin percentage for display
        const priceDifference = sellingPrice - basePrice;
        const marginPercentage = (priceDifference / basePrice) * 100;
        
        calculatedTotalBonus += itemBonus;
        totalMarginPercentage += marginPercentage;
        validItemsCount += 1;
      }
    });
    
    return {
      bonus: calculatedTotalBonus,
      avgMargin: validItemsCount > 0 ? totalMarginPercentage / validItemsCount : 0
    };
  }, [items]);
  
  // Get bonus data from props or calculate it
  const [calculatedTotalBonus, setCalculatedTotalBonus] = useState(0);
  const [calculatedAvgMargin, setCalculatedAvgMargin] = useState(0);
  
  useEffect(() => {
    if (totalBonus !== undefined) {
      setCalculatedTotalBonus(totalBonus);
    } else {
      const result = calculateTotalBonus();
      setCalculatedTotalBonus(result.bonus);
    }
    
    if (avgMargin !== undefined) {
      setCalculatedAvgMargin(avgMargin);
    } else {
      const result = calculateTotalBonus();
      setCalculatedAvgMargin(result.avgMargin);
    }
  }, [totalBonus, avgMargin, calculateTotalBonus]);
  
  // Calculate metrics impact
  const fetchProjectedMetrics = useCallback(async () => {
    if (!isValid) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would be an API call
      // Here we use the simulateMetricsImpact utility
      setTimeout(() => {
        const metricsData = simulateMetricsImpact(
          calculatedTotalBonus,
          calculatedAvgMargin,
          total
        );
        
        setMetrics(metricsData);
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error('Error fetching projected metrics:', err);
      setError('Не удалось рассчитать влияние на метрики');
      setLoading(false);
    }
  }, [isValid, calculatedTotalBonus, calculatedAvgMargin, total]);
  
  // Update metrics when order data changes
  useEffect(() => {
    if (isValid) {
      const timer = setTimeout(() => {
        fetchProjectedMetrics();
      }, 500); // Debounce
  
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isValid, fetchProjectedMetrics, items, calculatedTotalBonus, calculatedAvgMargin]);
  
  // Listen for order item update events
  useEffect(() => {
    const handleOrderItemUpdate = () => {
      const result = calculateTotalBonus();
      setCalculatedTotalBonus(result.bonus);
      setCalculatedAvgMargin(result.avgMargin);
    };
    
    document.addEventListener('orderItemUpdated', handleOrderItemUpdate);
    
    return () => {
      document.removeEventListener('orderItemUpdated', handleOrderItemUpdate);
    };
  }, [calculateTotalBonus]);
  
  // Show guidance when form is incomplete
  if (!isValid) {
    return (
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Влияние на метрики и бонусы
        </Typography>
        <Alert severity="info">
          Заполните информацию о клиенте и добавьте товары, чтобы увидеть расчет метрик и потенциальных бонусов.
        </Alert>
      </Card>
    );
  }
  
  // Show loading state
  if (loading || !metrics) {
    return (
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Расчет метрик и бонусов...
        </Typography>
        <Box sx={{ width: '100%', py: 5, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Влияние на метрики и бонусы
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Card>
    );
  }
  
  // Determine color for bonus display
  const bonusColor = calculatedTotalBonus < 0 ? 'error.main' : 'success.main';
  const bonusBackgroundColor = calculatedTotalBonus < 0 ? `${theme.palette.error.main}10` : `${theme.palette.success.main}10`;
  const bonusBorderColor = calculatedTotalBonus < 0 ? theme.palette.error.main : theme.palette.success.main;
  
  // Prepare chart data for metrics impact
  const chartOptions = {
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
  
  const chartSeries = [
    {
      name: 'Текущие',
      data: [
        metrics.current.kpi || 0,
        metrics.current.overallPerformance || 0,
        metrics.current.workVolume || 0,
        metrics.current.activity || 0,
      ],
    },
    {
      name: 'Прогноз',
      data: [
        metrics.projected.kpi || 0,
        metrics.projected.overallPerformance || 0,
        metrics.projected.workVolume || 0,
        metrics.projected.activity || 0,
      ],
    },
  ];
  
  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Влияние на метрики и бонусы
      </Typography>
      
      <Grid container spacing={3}>
        {/* Potential bonus */}
        <Grid item xs={12} md={4}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2.5, 
              height: '100%',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderColor: bonusBorderColor,
              bgcolor: bonusBackgroundColor,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Потенциальный бонус
            </Typography>
            <Typography variant="h3" sx={{ color: bonusColor }}>
              {calculatedTotalBonus.toLocaleString()} ₸
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
              Будет начислен после оплаты заказа
            </Typography>
          </Paper>
        </Grid>
        
        {/* Metrics impact */}
        <Grid item xs={12} md={8}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2.5,
              height: '100%',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Влияние на показатели эффективности
            </Typography>
            
            <Box sx={{ height: 220 }}>
              <ApexChart
                type="bar"
                series={chartSeries}
                options={chartOptions}
                height="100%"
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Detailed metrics comparison */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Детальное сравнение показателей
            </Typography>
            
            <Grid container spacing={2}>
              {/* KPI */}
              <Grid item xs={12} md={3}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    KPI
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      Текущий: {metrics.current.kpi.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color={metrics.impact.kpi > 0 ? 'success.main' : 'error.main'}>
                      {metrics.impact.kpi > 0 ? '+' : ''}{metrics.impact.kpi.toFixed(1)}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(metrics.projected.kpi / 100) * 100} 
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Stack>
              </Grid>
              
              {/* Effectiveness */}
              <Grid item xs={12} md={3}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Эффективность
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      Текущая: {metrics.current.overallPerformance.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color={metrics.impact.overallPerformance > 0 ? 'success.main' : 'error.main'}>
                      {metrics.impact.overallPerformance > 0 ? '+' : ''}{metrics.impact.overallPerformance.toFixed(1)}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(metrics.projected.overallPerformance / 100) * 100} 
                    sx={{ height: 8, borderRadius: 1 }}
                    color="success"
                  />
                </Stack>
              </Grid>
              
              {/* Work volume */}
              <Grid item xs={12} md={3}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Объем работы
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      Текущий: {metrics.current.workVolume.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color={metrics.impact.workVolume > 0 ? 'success.main' : 'error.main'}>
                      {metrics.impact.workVolume > 0 ? '+' : ''}{metrics.impact.workVolume.toFixed(1)}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(metrics.projected.workVolume / 100) * 100} 
                    sx={{ height: 8, borderRadius: 1 }}
                    color="info"
                  />
                </Stack>
              </Grid>
              
              {/* Activity */}
              <Grid item xs={12} md={3}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Активность
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      Текущая: {metrics.current.activity.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color={metrics.impact.activity > 0 ? 'success.main' : 'error.main'}>
                      {metrics.impact.activity > 0 ? '+' : ''}{metrics.impact.activity.toFixed(1)}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(metrics.projected.activity / 100) * 100} 
                    sx={{ height: 8, borderRadius: 1 }}
                    color="warning"
                  />
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Bonus calculation info */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2.5, bgcolor: 'info.lighter', color: 'info.dark' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2">
                Бонусы рассчитываются как {BASE_BONUS_PERCENTAGE}% от базовой цены, пропорционально цене продажи
              </Typography>
            </Stack>
            {calculatedAvgMargin > 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Средняя маржа по заказу: {calculatedAvgMargin.toFixed(1)}%
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Card>
  );
}