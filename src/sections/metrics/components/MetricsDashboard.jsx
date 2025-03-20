// src/sections/metrics/components/MetricsDashboard.jsx
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  Grid,
  Chip,
  Stack,
  Typography,
  Button,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { m } from 'framer-motion';

// Import MetricCard component
import MetricCard from './MetricCard';

export default function MetricsDashboard({ 
  metrics, 
  departmentAverage,
  persistKey // Key for saving to localStorage
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // List of all available metrics
  const availableMetrics = [
    { 
      key: 'overall_performance', 
      title: 'Общая эффективность',
      description: 'Совокупная оценка всех показателей',
      icon: '📊',
      bgColor: theme.palette.primary.main
    },
    { 
      key: 'kpi', 
      title: 'KPI',
      description: departmentAverage ? 
        `${Math.round(departmentAverage.kpi)}% - средний KPI отдела` : 
        "Ключевые показатели эффективности",
      icon: '⭐',
      bgColor: theme.palette.info.main
    },
    { 
      key: 'work_volume', 
      title: 'Объем работы',
      description: 'Выполнение плановых объемов',
      icon: '📈',
      bgColor: theme.palette.warning.main
    },
    { 
      key: 'quality', 
      title: 'Качество работы',
      description: 'Оценка качества выполненной работы',
      icon: '✓',
      bgColor: theme.palette.success.main
    },
    { 
      key: 'speed', 
      title: 'Скорость',
      description: 'Скорость выполнения задач',
      icon: '⚡',
      bgColor: theme.palette.error.main
    },
    { 
      key: 'plan_completion', 
      title: 'Выполнение плана',
      description: 'Процент выполнения плана',
      icon: '📅',
      bgColor: theme.palette.secondary.main
    },
    { 
      key: 'financial', 
      title: 'Финансовые показатели',
      description: 'Финансовые результаты',
      icon: '💰',
      bgColor: '#6B7280',
      showProgress: false
    },
    { 
      key: 'operational', 
      title: 'Операционные показатели',
      description: 'Операционная эффективность',
      icon: '🔧',
      bgColor: '#10B981',
      showProgress: false
    }
  ];
  
  // Load saved settings from localStorage
  const loadSavedSettings = () => {
    const defaultMetrics = availableMetrics.map(met => met.key);
    
    if (!persistKey) return defaultMetrics;
    
    try {
      const saved = localStorage.getItem(`dashboard-metrics-${persistKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.selectedMetrics || defaultMetrics;
      }
    } catch (error) {
      console.error('Error loading saved dashboard metrics settings:', error);
    }
    
    return defaultMetrics;
  };
  
  // State for selected metrics
  const [selectedMetrics, setSelectedMetrics] = useState(loadSavedSettings());
  const [showSelector, setShowSelector] = useState(false);
  
  // Save settings to localStorage on change
  useEffect(() => {
    if (persistKey) {
      try {
        localStorage.setItem(`dashboard-metrics-${persistKey}`, JSON.stringify({
          selectedMetrics
        }));
      } catch (error) {
        console.error('Error saving dashboard metrics settings:', error);
      }
    }
  }, [selectedMetrics, persistKey]);
  
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
  
  // Reset to all metrics
  const handleReset = () => {
    setSelectedMetrics(availableMetrics.map(met => met.key));
  };
  
  // Calculate columns based on number of selected metrics and screen size
  const getGridSize = () => {
    const count = selectedMetrics.length;
    
    if (count <= 4) return 3; // 4 cards per row on large screens
    return 3; // 4 cards per row on large screens, regardless of count
  };
  
  return (
    <>
      {/* Metrics Selector */}
      <Card 
        component={m.div}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{ 
          mb: 3,
          boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
          borderRadius: 2,
          overflow: 'visible',
          display: showSelector ? 'block' : 'none'
        }}
      >
        <CardHeader 
          title="Отображаемые метрики" 
          subheader="Выберите метрики, которые хотите отслеживать"
          action={
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
                      <Typography variant="body2" component="span">{metric.title}</Typography>
                    </Stack>
                  }
                  onClick={() => toggleMetric(metric.key)}
                  variant={isSelected ? "filled" : "outlined"}
                  sx={{ 
                    bgcolor: isSelected ? theme.palette.mode === 'dark' 
                      ? theme.palette.action.selected 
                      : `${metric.bgColor}1A` : 'transparent',
                    color: isSelected ? metric.bgColor : 'text.primary',
                    borderColor: isSelected ? `${metric.bgColor}4D` : 'divider',
                    '&:hover': {
                      bgcolor: isSelected ? `${metric.bgColor}33` : theme.palette.action.hover,
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
      
      {/* Toggle Button */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => setShowSelector(!showSelector)}
          startIcon={<Box component="span" sx={{ fontSize: '1rem' }}>{showSelector ? '✖' : '⚙️'}</Box>}
        >
          {showSelector ? 'Скрыть настройки' : 'Настроить метрики'}
        </Button>
      </Box>
      
      {/* Metrics Dashboard */}
      <Grid 
        container 
        spacing={3} 
        component={m.div}
        layout
        sx={{ mb: 3 }}
      >
        {availableMetrics
          .filter(metric => selectedMetrics.includes(metric.key))
          .map((metric, index) => {
            const metricValue = metrics[metric.key] || 0;
            const trend = metrics[`${metric.key}_trend`] || 0;
            
            // Extra values for financial & operational metrics
            let extraValue = null;
            let extraLabel = null;
            
            if (metric.key === 'financial' && metrics.bonuses?.summary) {
              extraValue = `${metrics.bonuses.summary.total_confirmed} ₸`;
              extraLabel = 'Подтвержденные бонусы';
            } else if (metric.key === 'operational' && metrics.bonuses?.summary) {
              extraValue = `${metrics.bonuses.summary.confirmation_rate}%`;
              extraLabel = 'Коэффициент подтверждения';
            }
            
            return (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={getGridSize()} 
                key={metric.key}
                component={m.div}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.05, 
                  ease: "easeOut" 
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <MetricCard 
                  title={metric.title}
                  value={metricValue}
                  trend={trend}
                  description={metric.description}
                  icon={metric.icon}
                  bgColor={metric.bgColor}
                  showProgress={metric.showProgress !== false}
                  extraValue={extraValue}
                  extraLabel={extraLabel}
                  tooltipTitle={metric.description}
                />
              </Grid>
            );
          })}
      </Grid>
    </>
  );
}

MetricsDashboard.propTypes = {
  metrics: PropTypes.object.isRequired,
  departmentAverage: PropTypes.object,
  persistKey: PropTypes.string
};