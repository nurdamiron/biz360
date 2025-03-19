// src/sections/metrics/components/OperationalMetricsCard.jsx
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
import { fNumber, fPercent } from 'src/utils/format-number';

// Имитация иконок с помощью emoji для демонстрации
const Icons = {
  Clock: '⏱️',
  CheckCircle: '✓',
  Efficiency: '⚙️',
  Info: 'ℹ️',
  MoreVert: '⋮',
  Calendar: '📅',
  Download: '📥',
  Compare: '⇆',
  ArrowUpward: '↑',
  ArrowDownward: '↓'
};

export default function OperationalMetricsCard({ metrics }) {
  const theme = useTheme();
  const [period, setPeriod] = useState('month');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Операционные показатели с фиксированными значениями из скриншота
  const operationalMetrics = [
    {
      id: 'timeliness',
      name: 'Своевременность',
      value: 88.0,
      previous: 86.5, 
      icon: Icons.Clock,
      format: (val) => `${val.toFixed(1)}%`,
      color: theme.palette.success.main,
      description: 'Процент задач, выполненных в срок',
      suffix: '%',
      percentage: 88.0,
      bgColor: alpha(theme.palette.success.main, 0.1),
      change: 1.7,
      changeDirection: 'up'
    },
    {
      id: 'plan_completion',
      name: 'Выполнение плана',
      value: 92.6,
      previous: 90.1,
      icon: Icons.CheckCircle,
      format: (val) => `${val.toFixed(1)}%`,
      color: theme.palette.success.main,
      description: 'Процент выполнения планового объема работ',
      suffix: '%',
      percentage: 92.6,
      bgColor: alpha(theme.palette.warning.main, 0.1),
      change: 2.8,
      changeDirection: 'up'
    },
    {
      id: 'efficiency',
      name: 'Эффективность',
      value: 85.0,
      previous: 86.2,
      icon: Icons.Efficiency,
      format: (val) => `${val.toFixed(1)}%`,
      color: theme.palette.success.main,
      description: 'Общий показатель эффективности работы',
      suffix: '%',
      percentage: 85.0,
      bgColor: alpha(theme.palette.success.main, 0.1),
      change: 1.4,
      changeDirection: 'down'
    }
  ];

  // Получение значений для иконки тренда
  const getTrendIcon = (direction) => direction === 'up' ? Icons.ArrowUpward : Icons.ArrowDownward;

  // Получение цвета для тренда
  const getTrendColor = (direction) => direction === 'up' 
    ? theme.palette.success.main 
    : theme.palette.error.main;

  const handlePeriodChange = (event, newPeriod) => {
    setPeriod(newPeriod);
  };
  
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
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
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
            Операционные показатели
          </Typography>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ 
                mr: 1,
                borderRadius: '4px',
                fontSize: '0.875rem',
                minWidth: 'auto',
                boxShadow: 'none',
                textTransform: 'none',
                px: 1.5
              }}
            >
              <Box component="span" sx={{ 
                display: 'flex',
                alignItems: 'center',
                '& svg': { mr: 0.5 }
              }}>
                {Icons.Calendar} Месяц
              </Box>
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
              <MenuItem onClick={handleMenuClose}>Сравнить с предыдущим периодом {Icons.Compare}</MenuItem>
              <MenuItem onClick={handleMenuClose}>Скачать отчет {Icons.Download}</MenuItem>
              <MenuItem onClick={handleMenuClose}>Настроить метрики</MenuItem>
            </Menu>
          </Box>
        }
        sx={{ 
          p: 2,
          pb: 0,
          '& .MuiCardHeader-action': {
            m: 0
          }
        }}
      />
      
      <Divider />
      
      <Box sx={{ px: 2, pt: 1 }}>
        <Tabs 
          value={period} 
          onChange={handlePeriodChange}
          variant="fullWidth"
          sx={{
            mb: 2,
            minHeight: 48,
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 1,
              py: 1.5,
              mr: 0,
              minHeight: 48,
              fontSize: '0.875rem',
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
        </Tabs>
      </Box>
      
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          {operationalMetrics.map((metric) => (
            <Box key={metric.id} sx={{ 
              p: 2, 
              borderRadius: 1, 
              bgcolor: metric.bgColor || alpha(theme.palette.success.main, 0.1),
              mb: 1.5,
              height: 'auto'
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    mr: 1.5, 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: alpha(metric.color, 0.2),
                    color: metric.color,
                    fontSize: '1.2rem'
                  }}>
                    {metric.icon}
                  </Box>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 0.25, fontSize: '0.95rem' }}>
                      {metric.name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.75rem'
                      }}
                    >
                      Подробнее {Icons.Info}
                    </Typography>
                  </Box>
                </Box>
                
                <Box 
                  sx={{ 
                    display: 'inline-block', 
                    bgcolor: alpha('#4a9ff5', 0.15), 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: 1,
                    ml: 2
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'text.primary' }}>
                    {metric.value.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                mt: 1.5,
                mb: 1
              }}>
                <Box sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1,
                  py: 0.5,
                  bgcolor: alpha(
                    metric.changeDirection === 'up' 
                      ? theme.palette.success.main 
                      : theme.palette.error.main, 
                    0.1
                  ),
                  color: metric.changeDirection === 'up' 
                    ? theme.palette.success.main 
                    : theme.palette.error.main,
                  borderRadius: 16,
                  fontWeight: 'medium',
                  fontSize: '0.8rem'
                }}>
                  {getTrendIcon(metric.changeDirection)} {metric.change.toFixed(1)}%
                </Box>
              </Box>
              
              <Box sx={{ mt: 0.5 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, metric.percentage)} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 5,
                    backgroundColor: alpha(theme.palette.success.main, 0.15),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      backgroundColor: theme.palette.success.main
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
                  0%
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  50%
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  100%
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

OperationalMetricsCard.propTypes = {
  metrics: PropTypes.shape({
    timeliness: PropTypes.number,
    plan_completion: PropTypes.number,
    efficiency: PropTypes.number
  })
};

OperationalMetricsCard.defaultProps = {
  metrics: {
    timeliness: 88.0,
    plan_completion: 92.6,
    efficiency: 85.0
  }
};