// src/sections/metrics/components/MetricsSelector.jsx
import PropTypes from 'prop-types';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  Chip,
  Stack,
  Typography,
  alpha,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { m } from 'framer-motion';

export default function MetricsSelector({ 
  onChange, 
  defaultMetrics = ['performance', 'kpi', 'quality'], 
  defaultViewType = 'line', 
  title,
  persistKey // Ключ для сохранения выбора в localStorage
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Список доступных метрик для отображения
  const availableMetrics = [
    { key: 'performance', label: 'Эффективность', color: theme.palette.primary.main, icon: '📊' },
    { key: 'kpi', label: 'KPI', color: theme.palette.info.main, icon: '⭐' },
    { key: 'quality', label: 'Качество', color: theme.palette.success.main, icon: '✓' },
    { key: 'work_volume', label: 'Объем работы', color: theme.palette.warning.main, icon: '📈' },
    { key: 'speed', label: 'Скорость', color: theme.palette.error.main, icon: '⚡' },
    { key: 'plan_completion', label: 'Выполнение плана', color: theme.palette.secondary.main, icon: '📅' },
    { key: 'financial', label: 'Финансы', color: '#8884d8', icon: '💰' },
    { key: 'operational', label: 'Операции', color: '#82ca9d', icon: '🔧' }
  ];
  
  // Загрузка сохраненных настроек из localStorage
  const loadSavedSettings = () => {
    if (!persistKey) return { metrics: defaultMetrics, viewType: defaultViewType };
    
    try {
      const saved = localStorage.getItem(`metrics-settings-${persistKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          metrics: parsed.metrics || defaultMetrics,
          viewType: parsed.viewType || defaultViewType
        };
      }
    } catch (error) {
      console.error('Error loading saved metrics settings:', error);
    }
    
    return { metrics: defaultMetrics, viewType: defaultViewType };
  };
  
  const savedSettings = loadSavedSettings();
  
  // Состояние для выбранных метрик и типа отображения
  const [selectedMetrics, setSelectedMetrics] = useState(savedSettings.metrics);
  const [viewType, setViewType] = useState(savedSettings.viewType);
  
  // Сохранение настроек в localStorage при изменении
  useEffect(() => {
    if (persistKey) {
      try {
        localStorage.setItem(`metrics-settings-${persistKey}`, JSON.stringify({
          metrics: selectedMetrics,
          viewType: viewType
        }));
      } catch (error) {
        console.error('Error saving metrics settings:', error);
      }
    }
    
    // Вызываем коллбэк для родительского компонента
    if (onChange) {
      onChange(selectedMetrics, viewType);
    }
  }, [selectedMetrics, viewType, persistKey, onChange]);
  
  // Обработчик переключения метрики
  const toggleMetric = (metricKey) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricKey)) {
        // Не разрешаем убрать все метрики (должна остаться хотя бы одна)
        if (prev.length > 1) {
          return prev.filter(key => key !== metricKey);
        }
        return prev;
      } else {
        return [...prev, metricKey];
      }
    });
  };
  
  // Обработчик сброса к значениям по умолчанию
  const handleReset = () => {
    setSelectedMetrics(defaultMetrics);
    setViewType(defaultViewType);
  };
  
  // Обработчик изменения типа отображения
  const handleViewTypeChange = (_, newType) => {
    if (newType !== null) {
      setViewType(newType);
    }
  };
  
  return (
    <Card 
      component={m.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{ 
        mb: 3,
        boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
        borderRadius: 2,
        overflow: 'visible'
      }}
    >
      <CardHeader 
        title={title || "Отображаемые метрики"} 
        subheader="Выберите метрики, которые хотите отслеживать"
        action={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Сбросить настройки">
              <Button 
                size="small" 
                variant="outlined" 
                onClick={handleReset}
                sx={{ minWidth: 32, px: 1 }}
              >
                ↺
              </Button>
            </Tooltip>
            
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={handleViewTypeChange}
              size="small"
              aria-label="тип отображения"
            >
              <ToggleButton value="line" aria-label="линейный график">
                <Box sx={{ fontSize: '1.1rem' }}>📈</Box>
              </ToggleButton>
              <ToggleButton value="area" aria-label="область">
                <Box sx={{ fontSize: '1.1rem' }}>📊</Box>
              </ToggleButton>
              <ToggleButton value="bar" aria-label="столбчатый график">
                <Box sx={{ fontSize: '1.1rem' }}>📋</Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        }
      />
      <Divider />
      <CardContent>
        <Stack 
          direction="row" 
          spacing={1} 
          flexWrap="wrap" 
          gap={1}
          sx={{ mb: selectedMetrics.length < availableMetrics.length ? 2 : 0 }}
        >
          {availableMetrics.map((metric) => {
            const isSelected = selectedMetrics.includes(metric.key);
            return (
              <Chip 
                key={metric.key}
                label={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Box component="span" sx={{ fontSize: '1rem' }}>{metric.icon}</Box>
                    <Typography variant="body2" component="span">{metric.label}</Typography>
                  </Stack>
                }
                onClick={() => toggleMetric(metric.key)}
                variant={isSelected ? "filled" : "outlined"}
                sx={{ 
                  bgcolor: isSelected ? alpha(metric.color, 0.1) : 'transparent',
                  color: isSelected ? metric.color : 'text.primary',
                  borderColor: isSelected ? alpha(metric.color, 0.3) : 'divider',
                  '&:hover': {
                    bgcolor: isSelected ? alpha(metric.color, 0.2) : alpha(theme.palette.action.hover, 0.1),
                  },
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
            );
          })}
        </Stack>
        
        {selectedMetrics.length < availableMetrics.length && (
          <Typography variant="caption" color="text.secondary">
            Выбрано {selectedMetrics.length} из {availableMetrics.length} метрик
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

MetricsSelector.propTypes = {
  onChange: PropTypes.func,
  defaultMetrics: PropTypes.array,
  defaultViewType: PropTypes.string,
  title: PropTypes.string,
  persistKey: PropTypes.string
};