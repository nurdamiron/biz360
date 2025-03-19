// src/sections/metrics/components/PerformanceChart.jsx - обновленная версия
import PropTypes from 'prop-types';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Typography,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';
import { useState, useEffect } from 'react';
import { m } from 'framer-motion';

// Пользовательский компонент для подсказок
const CustomTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 2,
          boxShadow: theme.customShadows?.z16 || '0 4px 20px 0 rgba(0,0,0,0.2)',
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          minWidth: 200
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
        {payload.map((entry, index) => (
          <Box key={`tooltip-item-${index}`} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  bgcolor: entry.color, 
                  mr: 1 
                }} 
              />
              <Typography variant="caption">{entry.name}</Typography>
            </Box>
            <Typography variant="caption" fontWeight="bold">{entry.value}%</Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

export default function PerformanceChart({ 
  data, 
  title, 
  subheader, 
  showControls = true,
  initialSelectedMetrics,
  initialChartType,
  onMetricsChange
}) {
  const theme = useTheme();
  
  // Состояние для выбора отображаемых метрик
  const [selectedMetrics, setSelectedMetrics] = useState(initialSelectedMetrics || ['performance', 'kpi', 'quality']);
  
  // Состояние для выбора типа графика
  const [chartType, setChartType] = useState(initialChartType || 'line');
  
  // Эффект для обновления при изменении внешних пропсов
  useEffect(() => {
    if (initialSelectedMetrics) {
      setSelectedMetrics(initialSelectedMetrics);
    }
  }, [initialSelectedMetrics]);

  useEffect(() => {
    if (initialChartType) {
      setChartType(initialChartType);
    }
  }, [initialChartType]);
  
  // Список доступных метрик для отображения
  const availableMetrics = [
    { key: 'performance', label: 'Эффективность', color: theme.palette.primary.main },
    { key: 'kpi', label: 'KPI', color: theme.palette.info.main },
    { key: 'quality', label: 'Качество', color: theme.palette.success.main },
    { key: 'work_volume', label: 'Объем работы', color: theme.palette.warning.main },
    { key: 'speed', label: 'Скорость', color: theme.palette.error.main },
    { key: 'plan_completion', label: 'Выполнение плана', color: theme.palette.secondary.main },
    { key: 'financial', label: 'Финансы', color: '#8884d8' },
    { key: 'operational', label: 'Операции', color: '#82ca9d' }
  ];
  
  // Функция для обновления списка отображаемых метрик
  const handleMetricsChange = (event) => {
    const { value } = event.target;
    setSelectedMetrics(value);
    if (onMetricsChange) {
      onMetricsChange(value, chartType);
    }
  };
  
  // Функция для изменения типа графика
  const handleChartTypeChange = (_, newType) => {
    if (newType !== null) {
      setChartType(newType);
      if (onMetricsChange) {
        onMetricsChange(selectedMetrics, newType);
      }
    }
  };
  
  // Выбор компонента графика в зависимости от типа
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 10 }
    };

    const commonAxes = (
      <>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
        <XAxis 
          dataKey="month" 
          axisLine={{ stroke: theme.palette.divider }}
          tickLine={false}
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
        />
        <YAxis 
          domain={[0, 100]} 
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value}%`}
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip theme={theme} />} />
        <Legend verticalAlign="top" height={36} />
        <ReferenceLine y={80} stroke={theme.palette.success.main} strokeDasharray="3 3" />
      </>
    );

    if (chartType === 'line') {
      return (
        <LineChart {...commonProps}>
          {commonAxes}
          {availableMetrics
            .filter(metric => selectedMetrics.includes(metric.key))
            .map(metric => (
              <Line 
                key={metric.key}
                type="monotone" 
                dataKey={metric.key} 
                name={metric.label} 
                stroke={metric.color} 
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0, fill: metric.color }}
              />
            ))
          }
        </LineChart>
      );
    } else if (chartType === 'area') {
      return (
        <AreaChart {...commonProps}>
          {commonAxes}
          {availableMetrics
            .filter(metric => selectedMetrics.includes(metric.key))
            .map(metric => (
              <Area 
                key={metric.key}
                type="monotone" 
                dataKey={metric.key} 
                name={metric.label} 
                stroke={metric.color} 
                fill={alpha(metric.color, 0.2)}
                strokeWidth={2}
                activeDot={{ r: 6, strokeWidth: 0, fill: metric.color }}
              />
            ))
          }
        </AreaChart>
      );
    } else if (chartType === 'bar') {
      return (
        <BarChart {...commonProps}>
          {commonAxes}
          {availableMetrics
            .filter(metric => selectedMetrics.includes(metric.key))
            .map(metric => (
              <Bar 
                key={metric.key}
                dataKey={metric.key} 
                name={metric.label} 
                fill={metric.color}
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            ))
          }
        </BarChart>
      );
    }
    
    // Default return to solve the ESLint error
    return null;
  };
  
  return (
    <Card 
      component={m.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{ 
        height: '100%', 
        boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
        borderRadius: 2
      }}
    >
      <CardHeader 
        title={title || "Динамика показателей"}
        subheader={subheader || "Изменение метрик по периодам"}
      />
      <Divider />
      
      {showControls && (
        <Box sx={{ px: 3, py: 1.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="metrics-select-label">Отображаемые метрики</InputLabel>
              <Select
                labelId="metrics-select-label"
                id="metrics-select"
                multiple
                value={selectedMetrics}
                onChange={handleMetricsChange}
                label="Отображаемые метрики"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const metric = availableMetrics.find(met => met.key === value);
                      return (
                        <Box 
                          key={value}
                          sx={{ 
                            px: 1, 
                            borderRadius: 1, 
                            bgcolor: alpha(metric?.color || theme.palette.primary.main, 0.1),
                            color: metric?.color || theme.palette.primary.main,
                            fontSize: '0.8rem'
                          }}
                        >
                          {metric?.label || value}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              >
                {availableMetrics.map((metric) => (
                  <MenuItem key={metric.key} value={metric.key}>
                    <Box 
                      sx={{ 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        bgcolor: metric.color, 
                        mr: 1, 
                        display: 'inline-block' 
                      }} 
                    />
                    {metric.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              size="small"
            >
              <ToggleButton value="line">
                <Box sx={{ fontSize: '1.1rem' }}>📈</Box>
              </ToggleButton>
              <ToggleButton value="area">
                <Box sx={{ fontSize: '1.1rem' }}>📊</Box>
              </ToggleButton>
              <ToggleButton value="bar">
                <Box sx={{ fontSize: '1.1rem' }}>📊</Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>
      )}
      
      <Divider />
      
      <CardContent>
        <Box sx={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

PerformanceChart.propTypes = {
  data: PropTypes.array.isRequired,
  title: PropTypes.string,
  subheader: PropTypes.string,
  showControls: PropTypes.bool,
  initialSelectedMetrics: PropTypes.array,
  initialChartType: PropTypes.string,
  onMetricsChange: PropTypes.func
};