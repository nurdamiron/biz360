// src/sections/metrics/components/MetricsHistoryDashboard.jsx
import PropTypes from 'prop-types';
import { 
  Box, 
  Grid,
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  Chip,
  Stack,
  Typography,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import PerformanceChart from './PerformanceChart';
import MetricsSelector from './MetricsSelector';

// Компонент дашборда с выбором метрик и графиком
export default function MetricsHistoryDashboard({ 
  data, 
  title, 
  chartTitle,
  description,
  defaultMetrics = ['performance', 'kpi', 'quality'],
  defaultChartType = 'line',
  allowedMetrics,
  persistKey // Ключ для сохранения настроек в localStorage
}) {
  const theme = useTheme();
  
  // Загрузка сохраненных настроек из localStorage, если они есть
  const loadSavedSettings = () => {
    if (!persistKey) return { metrics: defaultMetrics, chartType: defaultChartType };
    
    try {
      const saved = localStorage.getItem(`metrics-settings-${persistKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          metrics: parsed.metrics || defaultMetrics,
          chartType: parsed.chartType || defaultChartType
        };
      }
    } catch (error) {
      console.error('Error loading saved metrics settings:', error);
    }
    
    return { metrics: defaultMetrics, chartType: defaultChartType };
  };
  
  const savedSettings = loadSavedSettings();
  
  // Состояния для хранения выбранных настроек
  const [selectedMetrics, setSelectedMetrics] = useState(savedSettings.metrics);
  const [chartType, setChartType] = useState(savedSettings.chartType);
  
  // Сохранение настроек в localStorage при изменении
  useEffect(() => {
    if (persistKey) {
      try {
        localStorage.setItem(`metrics-settings-${persistKey}`, JSON.stringify({
          metrics: selectedMetrics,
          chartType: chartType
        }));
      } catch (error) {
        console.error('Error saving metrics settings:', error);
      }
    }
  }, [selectedMetrics, chartType, persistKey]);
  
  // Обработчик изменения настроек метрик
  const handleMetricsChange = (newMetrics, newChartType) => {
    if (newMetrics) setSelectedMetrics(newMetrics);
    if (newChartType) setChartType(newChartType);
  };
  
  return (
    <Grid container spacing={3}>
      {/* Компонент выбора метрик */}
      <Grid item xs={12}>
        <MetricsSelector 
          onChange={handleMetricsChange}
          defaultMetrics={selectedMetrics}
          title={title || "История показателей"}
        />
      </Grid>
      
      {/* График истории метрик */}
      <Grid item xs={12}>
        <PerformanceChart
          data={data}
          title={chartTitle || "Изменение метрик"}
          subheader={description || "Динамика выбранных показателей"}
          showControls={false}
          initialSelectedMetrics={selectedMetrics}
          initialChartType={chartType}
          onMetricsChange={handleMetricsChange}
        />
      </Grid>
    </Grid>
  );
}

MetricsHistoryDashboard.propTypes = {
  data: PropTypes.array.isRequired,
  title: PropTypes.string,
  chartTitle: PropTypes.string,
  description: PropTypes.string,
  defaultMetrics: PropTypes.array,
  defaultChartType: PropTypes.string,
  allowedMetrics: PropTypes.array,
  persistKey: PropTypes.string
};