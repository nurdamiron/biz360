// src/sections/metrics/components/PerformanceChart.jsx
import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  useTheme 
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Import our new ChartMetricsSelector component
import ChartMetricsSelector from './ChartMetricsSelector';

export default function PerformanceChart({ data, title, subheader, chartId }) {
  const theme = useTheme();
  const [selectedMetrics, setSelectedMetrics] = useState(['performance', 'kpi', 'quality']);
  const [chartType, setChartType] = useState('line');
  
  // All available metrics config
  const metricsConfig = {
    performance: { 
      name: 'Эффективность', 
      color: theme.palette.primary.main,
      dataKey: 'performance'
    },
    kpi: { 
      name: 'KPI', 
      color: theme.palette.info.main,
      dataKey: 'kpi'
    },
    quality: { 
      name: 'Качество', 
      color: theme.palette.success.main,
      dataKey: 'quality'
    },
    work_volume: { 
      name: 'Объем работы', 
      color: theme.palette.warning.main,
      dataKey: 'work_volume'
    },
    speed: { 
      name: 'Скорость', 
      color: theme.palette.error.main,
      dataKey: 'speed'
    },
    plan_completion: { 
      name: 'Выполнение плана', 
      color: theme.palette.secondary.main,
      dataKey: 'plan_completion'
    }
  };
  
  // Handle metrics and chart type change from selector
  const handleSelectorChange = (metrics, type) => {
    setSelectedMetrics(metrics);
    setChartType(type);
  };
  
  // Tooltip formatter to display metrics names in Russian
  const tooltipFormatter = (value, name) => {
    // Find the metric config that matches this dataKey
    const metricEntry = Object.values(metricsConfig).find(m => m.dataKey === name);
    return [value ? `${value}%` : '0%', metricEntry ? metricEntry.name : name];
  };
  
  // Dynamically render the appropriate chart based on selected type
  const renderChart = () => {
    const props = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };
    
    const commonProps = {
      strokeWidth: 2,
      activeDot: { r: 8 }
    };
    
    // Filter out unselected metrics
    const filteredMetrics = Object.entries(metricsConfig)
      .filter(([key]) => selectedMetrics.includes(key))
      .map(([key, config]) => config);
    
    switch(chartType) {
      case 'area':
        return (
          <AreaChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
            {filteredMetrics.map((metric) => (
              <Area 
                key={metric.dataKey}
                type="monotone" 
                dataKey={metric.dataKey} 
                name={metric.name}
                stroke={metric.color} 
                fillOpacity={0.3}
                fill={alpha(metric.color, 0.3)}
                {...commonProps}
              />
            ))}
          </AreaChart>
        );
        
      case 'bar':
        return (
          <BarChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
            {filteredMetrics.map((metric) => (
              <Bar 
                key={metric.dataKey}
                dataKey={metric.dataKey} 
                name={metric.name}
                fill={metric.color} 
                fillOpacity={0.8}
                barSize={20}
              />
            ))}
          </BarChart>
        );
        
      case 'line':
      default:
        return (
          <LineChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
            {filteredMetrics.map((metric) => (
              <Line 
                key={metric.dataKey}
                type="monotone" 
                dataKey={metric.dataKey} 
                name={metric.name}
                stroke={metric.color} 
                {...commonProps}
              />
            ))}
          </LineChart>
        );
    }
  };
  
  return (
    <Card sx={{ 
      mb: 3,
      borderRadius: 2,
      boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
    }}>
      <CardHeader
        title={title || "График показателей"}
        subheader={subheader}
      />
      <Divider />
      <CardContent>
        {/* Include the metrics selector component */}
        <ChartMetricsSelector
          onChange={handleSelectorChange}
          defaultMetrics={selectedMetrics}
          defaultViewType={chartType}
          persistKey={chartId || 'performance-chart'}
        />
        
        <Box sx={{ height: 375, width: '100%' }}>
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
  chartId: PropTypes.string
};