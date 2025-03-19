// src/sections/metrics/components/EmployeePerformanceBarChart.jsx
import PropTypes from 'prop-types';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
  Chip,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LabelList 
} from 'recharts';
import { useState } from 'react';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';

// Пользовательский компонент для подсказок
const CustomTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    const employee = payload[0].payload;
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
        <Typography variant="subtitle2" sx={{ mb: 1 }}>{employee.name}</Typography>
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

const getMetricColor = (value, theme) => {
  if (value >= 80) return theme.palette.success.main;
  if (value >= 60) return theme.palette.warning.main;
  return theme.palette.error.main;
};

export default function EmployeePerformanceBarChart({ employees, departmentColor, title, subheader }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Состояние для выбора метрики для сортировки
  const [sortMetric, setSortMetric] = useState('kpi');
  
  // Список доступных метрик для сортировки
  const availableMetrics = [
    { key: 'kpi', label: 'KPI' },
    { key: 'work_volume', label: 'Объем работы' },
    { key: 'quality', label: 'Качество работы' },
    { key: 'speed', label: 'Скорость' },
    { key: 'plan_completion', label: 'План' }
  ];
  
  // Сортировка сотрудников по выбранной метрике
  const sortedEmployees = [...employees].sort((a, b) => {
    const metricA = a.metrics[sortMetric] || 0;
    const metricB = b.metrics[sortMetric] || 0;
    return metricB - metricA; // Сортировка по убыванию
  }).slice(0, 8); // Ограничиваем количество сотрудников для отображения
  
  // Расчет средних значений для метрик
  const averages = {
    kpi: Math.round(employees.reduce((sum, emp) => sum + (emp.metrics.kpi || 0), 0) / employees.length),
    work_volume: Math.round(employees.reduce((sum, emp) => sum + (emp.metrics.work_volume || 0), 0) / employees.length),
    quality: Math.round(employees.reduce((sum, emp) => sum + (emp.metrics.quality || 0), 0) / employees.length),
    speed: Math.round(employees.reduce((sum, emp) => sum + (emp.metrics.speed || 0), 0) / employees.length),
    plan_completion: Math.round(employees.reduce((sum, emp) => sum + (emp.metrics.plan_completion || 0), 0) / employees.length)
  };
  
  // Цвета для метрик
  const metricColors = {
    kpi: theme.palette.primary.main,
    work_volume: theme.palette.info.main,
    quality: theme.palette.success.main,
    speed: theme.palette.error.main,
    plan_completion: theme.palette.warning.main
  };
  
  // Получение цвета для среднего значения
  const getAverageChipColor = (key) => {
    const value = averages[key];
    return getMetricColor(value, theme);
  };

  return (
    <LazyMotion features={domAnimation}>
    <Card 
      component={m.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{ 
        boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
        borderRadius: 2,
        overflow: 'visible'
      }}
    >
      <CardHeader 
        title={title || "Рейтинг сотрудников"}
        subheader={subheader || "Показатели эффективности по метрикам"}
        action={
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="sort-metric-label">Сортировать по</InputLabel>
            <Select
              labelId="sort-metric-label"
              id="sort-metric"
              value={sortMetric}
              label="Сортировать по"
              onChange={(e) => setSortMetric(e.target.value)}
            >
              {availableMetrics.map((metric) => (
                <MenuItem key={metric.key} value={metric.key}>{metric.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        }
      />
      <Divider />
      
      {/* Показываем средние значения */}
      <Box sx={{ px: 3, py: 1.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Средние показатели:</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          {availableMetrics.map((metric) => (
            <Chip 
              key={metric.key}
              label={`${metric.label}: ${averages[metric.key]}%`}
              size="small"
              sx={{ 
                bgcolor: alpha(getAverageChipColor(metric.key), 0.1),
                color: getAverageChipColor(metric.key),
                border: `1px solid ${alpha(getAverageChipColor(metric.key), 0.2)}`
              }}
            />
          ))}
        </Stack>
      </Box>
      
      <Divider />
      
      <CardContent>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={sortedEmployees}
              margin={{ top: 10, right: 30, left: isMobile ? 80 : 100, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
              <XAxis 
                type="number" 
                domain={[0, 100]} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
                width={isMobile ? 80 : 100}
              />
              <Tooltip 
                content={<CustomTooltip theme={theme} />}
              />
              <Legend verticalAlign="top" height={36} />
              
              {/* Отображаем выбранную метрику */}
              <Bar 
                dataKey={(record) => record.metrics[sortMetric] || 0} 
                name={availableMetrics.find(metric => metric.key === sortMetric)?.label || sortMetric}
                fill={metricColors[sortMetric] || departmentColor} 
                radius={[0, 4, 4, 0]}
                barSize={30}
                minPointSize={2}
              >
                <LabelList 
                  dataKey={(record) => record.metrics[sortMetric] || 0} 
                  position="right" 
                  formatter={(value) => `${value}%`}
                  style={{ fill: theme.palette.text.primary, fontWeight: 'bold', fontSize: 12 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
    </LazyMotion>

  );
}

EmployeePerformanceBarChart.propTypes = {
  employees: PropTypes.array.isRequired,
  departmentColor: PropTypes.string.isRequired,
  title: PropTypes.string,
  subheader: PropTypes.string
};