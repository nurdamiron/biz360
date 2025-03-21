// src/sections/sales/components/lead-analytics/LeadValueByTimeChart.jsx
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  Typography,
  CardHeader,
  CardContent,
  Divider,
  Skeleton,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useState } from 'react';

// Функция для форматирования валюты
const formatCurrency = (value) => new Intl.NumberFormat('kk-KZ', {
  style: 'currency',
  currency: 'KZT',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
}).format(value);

/**
 * Компонент для отображения динамики стоимости лидов во времени
 */
const LeadValueByTimeChart = ({ data, isLoading, period, title, subheader }) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState('area');
  const [valueType, setValueType] = useState('totalValue');
  
  // Если данные загружаются, показываем скелетон
  if (isLoading) {
    return (
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: theme.shadows[8]
        }}
      >
        <CardHeader
          title={<Skeleton variant="text" width={200} />}
          subheader={<Skeleton variant="text" width={300} />}
        />
        <Divider />
        <CardContent>
          <Skeleton variant="rectangular" height={400} />
        </CardContent>
      </Card>
    );
  }
  
  // Если данных нет, показываем сообщение
  if (!data || data.length === 0) {
    return (
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: theme.shadows[8]
        }}
      >
        <CardHeader
          title={title || "Динамика лидов во времени"}
          subheader={subheader || `Изменение показателей лидов по ${period || 'месяцам'}`}
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Тип графика</InputLabel>
                <Select
                  value={chartType}
                  label="Тип графика"
                  onChange={(e) => setChartType(e.target.value)}
                >
                  <MenuItem value="area">Область</MenuItem>
                  <MenuItem value="line">Линия</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Показатель</InputLabel>
                <Select
                  value={valueType}
                  label="Показатель"
                  onChange={(e) => setValueType(e.target.value)}
                >
                  <MenuItem value="totalValue">Общая стоимость</MenuItem>
                  <MenuItem value="avgValue">Средний чек</MenuItem>
                  <MenuItem value="count">Количество</MenuItem>
                </Select>
              </FormControl>
            </Box>
          }
        />
        <Divider />
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Нет данных для отображения
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Кастомный тултип для диаграммы
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Определяем заголовок тултипа в зависимости от типа значения
      let valueTitle = 'Общая стоимость';
      let valueFormatter = formatCurrency;
      
      if (valueType === 'avgValue') {
        valueTitle = 'Средний чек';
      } else if (valueType === 'count') {
        valueTitle = 'Количество лидов';
        valueFormatter = (val) => val;
      }
      
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            boxShadow: theme.shadows[3],
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {valueTitle}: <strong>{valueFormatter(payload[0].value)}</strong>
          </Typography>
          {payload[0].payload.count && valueType !== 'count' && (
            <Typography variant="body2" color="text.secondary">
              Количество: <strong>{payload[0].payload.count}</strong>
            </Typography>
          )}
          {payload[0].payload.conversionRate && (
            <Typography variant="body2" color="text.secondary">
              Конверсия: <strong>{payload[0].payload.conversionRate}%</strong>
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };
  
  CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    label: PropTypes.string
  };
  
  // Определение Y-области графика на основе типа значения
  const getYDomain = () => {
    if (valueType === 'count') {
      // Для количества лидов начинаем с нуля
      const maxCount = Math.max(...data.map(item => item.count));
      return [0, Math.ceil(maxCount * 1.1)]; // +10% для визуального отступа
    } else if (valueType === 'avgValue') {
      // Для среднего чека берем минимум и максимум
      const values = data.map(item => item.avgValue);
      const min = Math.min(...values);
      const max = Math.max(...values);
      return [Math.floor(min * 0.9), Math.ceil(max * 1.1)]; // ±10% для визуального отступа
    } else {
      // Для общей стоимости начинаем с нуля
      const maxValue = Math.max(...data.map(item => item.totalValue));
      return [0, Math.ceil(maxValue * 1.1)]; // +10% для визуального отступа
    }
  };
  
  // Определение форматтера для значений Y-оси
  const getYAxisTickFormatter = () => {
    if (valueType === 'count') {
      return (value) => value;
    } else {
      return (value) => formatCurrency(value);
    }
  };
  
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: theme.shadows[8]
      }}
    >
      <CardHeader
        title={title || "Динамика лидов во времени"}
        subheader={subheader || `Изменение показателей лидов по ${period || 'месяцам'}`}
        action={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Тип графика</InputLabel>
              <Select
                value={chartType}
                label="Тип графика"
                onChange={(e) => setChartType(e.target.value)}
              >
                <MenuItem value="area">Область</MenuItem>
                <MenuItem value="line">Линия</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Показатель</InputLabel>
              <Select
                value={valueType}
                label="Показатель"
                onChange={(e) => setValueType(e.target.value)}
              >
                <MenuItem value="totalValue">Общая стоимость</MenuItem>
                <MenuItem value="avgValue">Средний чек</MenuItem>
                <MenuItem value="count">Количество</MenuItem>
              </Select>
            </FormControl>
          </Box>
        }
      />
      <Divider />
      <CardContent>
        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 20,
                  bottom: 30
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis 
                  domain={getYDomain()} 
                  tickFormatter={getYAxisTickFormatter()} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey={valueType} 
                  stroke={theme.palette.primary.main} 
                  fill={alpha(theme.palette.primary.main, 0.2)} 
                  name={
                    valueType === 'totalValue' 
                      ? 'Общая стоимость' 
                      : valueType === 'avgValue' 
                        ? 'Средний чек' 
                        : 'Количество лидов'
                  }
                />
              </AreaChart>
            ) : (
              <LineChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 20,
                  bottom: 30
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis 
                  domain={getYDomain()} 
                  tickFormatter={getYAxisTickFormatter()} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={valueType} 
                  stroke={theme.palette.primary.main}
                  activeDot={{ r: 8 }} 
                  name={
                    valueType === 'totalValue' 
                      ? 'Общая стоимость' 
                      : valueType === 'avgValue' 
                        ? 'Средний чек' 
                        : 'Количество лидов'
                  }
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Box>
        
        {/* Дополнительная информация */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Ключевые выводы:
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {valueType === 'totalValue' && (
              <>
                Общая стоимость лидов {
                  data[data.length - 1]?.totalValue > data[0]?.totalValue
                    ? 'увеличилась' 
                    : 'уменьшилась'
                } за отчетный период с {formatCurrency(data[0]?.totalValue || 0)} до {formatCurrency(data[data.length - 1]?.totalValue || 0)}.
              </>
            )}
            
            {valueType === 'avgValue' && (
              <>
                Средний чек {
                  data[data.length - 1]?.avgValue > data[0]?.avgValue
                    ? 'увеличился' 
                    : 'уменьшился'
                } за отчетный период с {formatCurrency(data[0]?.avgValue || 0)} до {formatCurrency(data[data.length - 1]?.avgValue || 0)}.
              </>
            )}
            
            {valueType === 'count' && (
              <>
                Количество лидов {
                  data[data.length - 1]?.count > data[0]?.count
                    ? 'увеличилось' 
                    : 'уменьшилось'
                } за отчетный период с {data[0]?.count || 0} до {data[data.length - 1]?.count || 0}.
              </>
            )}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Тренд {
              (() => {
                const firstValue = data[0]?.[valueType] || 0;
                const lastValue = data[data.length - 1]?.[valueType] || 0;
                
                if (lastValue > firstValue * 1.1) return 'положительный и устойчивый';
                if (lastValue > firstValue) return 'слабо положительный';
                if (lastValue < firstValue * 0.9) return 'отрицательный';
                if (lastValue < firstValue) return 'слабо отрицательный';
                return 'стабильный';
              })()
            }.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

LeadValueByTimeChart.propTypes = {
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  period: PropTypes.string,
  title: PropTypes.string,
  subheader: PropTypes.string
};

export default LeadValueByTimeChart;