// src/sections/metrics/components/FinancialMetricsCard.jsx
import PropTypes from 'prop-types';
import { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Typography, 
  LinearProgress,
  Stack,
  Tooltip,
  IconButton,
  alpha,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  Button,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { fNumber, fCurrency, fPercent } from 'src/utils/format-number';

// Имитация иконок с помощью emoji для демонстрации
const Icons = {
  Money: '💰',
  Percent: '%',
  TrendingUp: '📈',
  Info: 'ℹ️',
  MoreVert: '⋮',
  ArrowUpward: '↑',
  ArrowDownward: '↓',
  Calendar: '📅',
  Download: '📥'
};

export default function FinancialMetricsCard({ metrics }) {
  const theme = useTheme();
  const [period, setPeriod] = useState('day'); // 'day', 'week', 'month', 'quarter', 'year'
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Получение значений метрик в зависимости от выбранного периода
  const getMetricValueByPeriod = (baseValue, periodType) => {
    const multipliers = {
      day: 0.033,
      week: 0.25,
      month: 1,
      quarter: 3,
      year: 12
    };
    return baseValue * multipliers[periodType];
  };
  
  // Расчет процента изменения
  const getChangePercent = (metric) => {
    const prevValue = metric.previous || metric.value * 0.9; // Имитация предыдущего значения
    return ((metric.value - prevValue) / prevValue) * 100;
  };
  
  // Финансовые показатели с расширенными данными
  const financialMetrics = [
    {
      id: 'revenue',
      name: 'Доход по клиентам',
      value: getMetricValueByPeriod(metrics.revenue || 39600, period),
      target: getMetricValueByPeriod(metrics.revenue_target || 49500, period),
      previous: getMetricValueByPeriod((metrics.revenue || 39600) * 0.95, period),
      icon: Icons.Money,
      format: (val) => period === 'day' ? `KZT ${val.toLocaleString()}` : fCurrency(val),
      color: theme.palette.success.main,
      description: 'Общий доход, полученный от всех клиентов в выбранном периоде',
      trendDirection: 'up',
      currency: 'KZT',
      change: metrics.revenue_change || 5.3,
      percentage: 80
    },
    {
      id: 'margin',
      name: 'Маржинальность',
      value: metrics.margin || 0.7,
      target: metrics.margin_target || 0.8,
      previous: (metrics.margin || 0.7) - 0.05,
      icon: Icons.Percent,
      format: (val) => period === 'day' ? `${(val * 100).toFixed(1)}%` : fPercent(val),
      color: theme.palette.info.main,
      description: 'Процент прибыли от общего дохода после вычета всех расходов',
      trendDirection: 'up',
      suffix: '%',
      change: metrics.margin_change || 7.5,
      percentage: 90
    },
    {
      id: 'growth',
      name: 'Рост продаж',
      value: metrics.growth || 0.1,
      target: metrics.growth_target || 0.1,
      previous: (metrics.growth || 0.1) - 0.02,
      icon: Icons.TrendingUp,
      format: (val) => period === 'day' ? `${(val * 100).toFixed(1)}%` : fPercent(val),
      color: theme.palette.warning.main,
      description: 'Процентное изменение в объеме продаж по сравнению с предыдущим периодом',
      trendDirection: metrics.growth > 0.05 ? 'up' : 'down',
      suffix: '%',
      change: metrics.growth_change || 33.3,
      percentage: 80
    }
  ];

  const handlePeriodChange = (event, newPeriod) => {
    setPeriod(newPeriod);
  };
  
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Функция для определения цвета тренда
  const getTrendColor = (value, previous) => {
    if (value > previous) return theme.palette.success.main;
    if (value < previous) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };
  
  // Функция для отображения иконки тренда
  const getTrendIcon = (value, previous) => {
    if (value > previous) return Icons.ArrowUpward;
    if (value < previous) return Icons.ArrowDownward;
    return '';
  };

  return (
    <Card sx={{ 
      height: '100%', 
      boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(0,0,0,0.1)',
      position: 'relative',
      '&:hover': {
        boxShadow: theme.customShadows?.z16 || '0 12px 24px 0 rgba(0,0,0,0.15)',
        transition: 'box-shadow 0.3s ease-in-out'
      }
    }}>
      <CardHeader 
        title={
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Финансовые показатели
          </Typography>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={Icons.Calendar}
              sx={{ mr: 1, fontSize: '0.75rem' }}
            >
              {period === 'day' && 'День'}
              {period === 'week' && 'Неделя'}
              {period === 'month' && 'Месяц'}
              {period === 'quarter' && 'Квартал'}
              {period === 'year' && 'Год'}
            </Button>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              aria-label="дополнительные опции"
            >
              {Icons.MoreVert}
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>Скачать отчет {Icons.Download}</MenuItem>
              <MenuItem onClick={handleMenuClose}>Подробный анализ</MenuItem>
              <MenuItem onClick={handleMenuClose}>Настроить метрики</MenuItem>
            </Menu>
          </Box>
        }
      />
      
      <Divider />
      
      <Box sx={{ px: 2, pt: 1 }}>
        <Tabs 
          value={period} 
          onChange={handlePeriodChange}
          variant={isMobile ? "fullWidth" : "scrollable"}
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: isMobile ? 'auto' : 60,
              px: isMobile ? 1 : 2,
              py: isMobile ? 0.75 : 1,
              mr: isMobile ? 0 : 1,
              fontSize: isMobile ? '0.875rem' : '0.75rem',
              fontWeight: 'medium',
              color: theme.palette.text.secondary,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                fontWeight: 'bold'
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab label="День" value="day" />
          <Tab label="Неделя" value="week" />
          <Tab label="Месяц" value="month" />
          {!isMobile && <Tab label="Квартал" value="quarter" />}
          {!isMobile && <Tab label="Год" value="year" />}
        </Tabs>
      </Box>
      
      <CardContent sx={{ pt: 2 }}>
        <Stack spacing={3}>
          {financialMetrics.map((metric) => {
            const progress = (metric.value / metric.target) * 100;
            const changePercent = getChangePercent(metric);
            const trendColor = getTrendColor(metric.value, metric.previous);
            const trendIcon = getTrendIcon(metric.value, metric.previous);
            
            return (
              <Box key={metric.id} sx={{ 
                p: isMobile ? 2.5 : 2, 
                borderRadius: 1, 
                bgcolor: alpha(metric.color, 0.08),
                transition: 'all 0.3s ease',
                mb: isMobile ? 1.5 : 0,
                '&:hover': {
                  bgcolor: alpha(metric.color, 0.15),
                  transform: 'translateY(-2px)'
                }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 2 : 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      mr: isMobile ? 1.5 : 1, 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: isMobile ? 40 : 32,
                      height: isMobile ? 40 : 32,
                      borderRadius: '50%',
                      bgcolor: alpha(metric.color, 0.2),
                      color: metric.color,
                      fontSize: isMobile ? '1.4rem' : '1.2rem'
                    }}>
                      {metric.icon}
                    </Box>
                    <Box>
                      <Typography variant={isMobile ? "body1" : "body2"} sx={{ fontWeight: 'medium' }}>
                        {metric.name}
                      </Typography>
                      <Tooltip title={metric.description} arrow>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: theme.palette.text.secondary,
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'help'
                          }}
                        >
                          Подробнее {Icons.Info}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  {!isMobile && (
                    <Box sx={{ textAlign: 'right' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: 'bold',
                          color: theme.palette.text.primary 
                        }}>
                          {metric.format(metric.value)}
                        </Typography>
                        <Tooltip title={`Изменение: ${Math.abs(changePercent).toFixed(1)}% по сравнению с предыдущим периодом`} arrow>
                          <Box sx={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: trendColor,
                            ml: 1,
                            bgcolor: alpha(trendColor, 0.1),
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}>
                            {trendIcon} {Math.abs(changePercent).toFixed(1)}%
                          </Box>
                        </Tooltip>
                      </Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Цель: {metric.format(metric.target)}
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {isMobile && (
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                    mt: 1
                  }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {metric.format(metric.value)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Цель: {metric.format(metric.target)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 1,
                      py: 0.5,
                      bgcolor: alpha(trendColor, 0.1),
                      color: trendColor,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      fontSize: '0.875rem'
                    }}>
                      {trendIcon} {metric.change.toFixed(1)}%
                    </Box>
                  </Box>
                )}
                
                <Box sx={{ mt: isMobile ? 2 : 2, mb: 0.5 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(progress, 100)} 
                    sx={{ 
                      height: isMobile ? 8 : 10, 
                      borderRadius: 5,
                      backgroundColor: alpha(metric.color, 0.15),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        backgroundColor: metric.color
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mt: 0.5
                }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {isMobile ? '0%' : '0'}
                  </Typography>
                  {!isMobile && (
                    <Typography variant="caption" sx={{ 
                      color: progress >= 100 ? metric.color : theme.palette.text.secondary,
                      fontWeight: progress >= 100 ? 'bold' : 'normal'
                    }}>
                      {progress.toFixed(0)}% {progress >= 100 && '✓'}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    100%
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

FinancialMetricsCard.propTypes = {
  metrics: PropTypes.shape({
    revenue: PropTypes.number,
    revenue_target: PropTypes.number,
    margin: PropTypes.number,
    margin_target: PropTypes.number,
    growth: PropTypes.number,
    growth_target: PropTypes.number
  })
};

FinancialMetricsCard.defaultProps = {
  metrics: {
    revenue: 1200000,
    revenue_target: 1500000,
    margin: 70,
    margin_target: 80,
    growth: 10,
    growth_target: 10
  }
};