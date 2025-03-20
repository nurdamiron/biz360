// src/sections/metrics/components/ChartMetricsSelector.jsx
import PropTypes from 'prop-types';
import { 
  Box, 
  Chip,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';

export default function ChartMetricsSelector({ 
  onChange, 
  defaultMetrics = ['performance', 'kpi', 'quality'], 
  defaultViewType = 'line',
  persistKey // Key for saving to localStorage
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // List of available metrics for display
  const availableMetrics = [
    { key: 'performance', label: 'Эффективность', color: theme.palette.primary.main, icon: '📊' },
    { key: 'kpi', label: 'KPI', color: theme.palette.info.main, icon: '⭐' },
    { key: 'quality', label: 'Качество', color: theme.palette.success.main, icon: '✓' },
    { key: 'work_volume', label: 'Объем работы', color: theme.palette.warning.main, icon: '📈' },
    { key: 'speed', label: 'Скорость', color: theme.palette.error.main, icon: '⚡' },
    { key: 'plan_completion', label: 'Выполнение плана', color: theme.palette.secondary.main, icon: '📅' }
  ];
  
  // Load saved settings from localStorage
  const loadSavedSettings = () => {
    if (!persistKey) return { metrics: defaultMetrics, viewType: defaultViewType };
    
    try {
      const saved = localStorage.getItem(`chart-metrics-${persistKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          metrics: parsed.metrics || defaultMetrics,
          viewType: parsed.viewType || defaultViewType
        };
      }
    } catch (error) {
      console.error('Error loading saved chart metrics settings:', error);
    }
    
    return { metrics: defaultMetrics, viewType: defaultViewType };
  };
  
  const savedSettings = loadSavedSettings();
  
  // State for selected metrics and chart type
  const [selectedMetrics, setSelectedMetrics] = useState(savedSettings.metrics);
  const [viewType, setViewType] = useState(savedSettings.viewType);
  
  // Save settings to localStorage on change
  useEffect(() => {
    if (persistKey) {
      try {
        localStorage.setItem(`chart-metrics-${persistKey}`, JSON.stringify({
          metrics: selectedMetrics,
          viewType: viewType
        }));
      } catch (error) {
        console.error('Error saving chart metrics settings:', error);
      }
    }
    
    // Call the callback for the parent component
    if (onChange) {
      onChange(selectedMetrics, viewType);
    }
  }, [selectedMetrics, viewType, persistKey, onChange]);
  
  // Handle metric toggle
  const toggleMetric = (metricKey) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricKey)) {
        // Don't allow removing all metrics (at least one must remain)
        if (prev.length > 1) {
          return prev.filter(key => key !== metricKey);
        }
        return prev;
      } else {
        return [...prev, metricKey];
      }
    });
  };
  
  // Handle view type change
  const handleViewTypeChange = (_, newType) => {
    if (newType !== null) {
      setViewType(newType);
    }
  };
  
  return (
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
        <Box sx={{ color: 'text.secondary', fontSize: '0.875rem', display: 'flex', alignItems: 'center', mr: 1 }}>
          Отображаемые метрики:
        </Box>
        {availableMetrics.map((metric) => {
          const isSelected = selectedMetrics.includes(metric.key);
          return (
            <Chip 
              key={metric.key}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Box component="span" sx={{ fontSize: '1rem' }}>{metric.icon}</Box>
                  <Box component="span">{metric.label}</Box>
                </Stack>
              }
              onClick={() => toggleMetric(metric.key)}
              variant={isSelected ? "filled" : "outlined"}
              size="small"
              sx={{ 
                bgcolor: isSelected ? theme.alpha ? theme.alpha(metric.color, 0.1) : `${metric.color}1A` : 'transparent',
                color: isSelected ? metric.color : 'text.primary',
                borderColor: isSelected ? theme.alpha ? theme.alpha(metric.color, 0.3) : `${metric.color}4D` : 'divider',
                '&:hover': {
                  bgcolor: isSelected 
                    ? theme.alpha ? theme.alpha(metric.color, 0.2) : `${metric.color}33` 
                    : theme.alpha ? theme.alpha(theme.palette.action.hover, 0.1) : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            />
          );
        })}
      </Stack>

      <ToggleButtonGroup
        value={viewType}
        exclusive
        onChange={handleViewTypeChange}
        size="small"
        aria-label="chart type"
      >
        <ToggleButton value="line" aria-label="line chart">
          <Box sx={{ fontSize: '1.1rem' }}>📈</Box>
        </ToggleButton>
        <ToggleButton value="bar" aria-label="bar chart">
          <Box sx={{ fontSize: '1.1rem' }}>📊</Box>
        </ToggleButton>
        <ToggleButton value="area" aria-label="area chart">
          <Box sx={{ fontSize: '1.1rem' }}>📶</Box>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

ChartMetricsSelector.propTypes = {
  onChange: PropTypes.func,
  defaultMetrics: PropTypes.array,
  defaultViewType: PropTypes.string,
  persistKey: PropTypes.string
};