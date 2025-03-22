// src/sections/sales/components/lead-distribution/employee-performance/EmployeeMetrics.jsx
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  LinearProgress,
  Divider,
  Chip,
  Tooltip,
  alpha,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';

// Material UI иконки
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

// Анимации для чисел
const countVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 15,
      duration: 0.5
    }
  }
};

/**
 * Компонент для отображения ключевых метрик сотрудника
 */
export default function EmployeeMetrics({ 
  loadPercentage, 
  currentLoad, 
  capacity, 
  stats, 
  totalPotentialAmount,
  formatCurrency,
  theme 
}) {
  // Получение цвета для нагрузки
  const getLoadColor = (percentage) => {
    if (percentage >= 90) return theme.palette.error.main;
    if (percentage >= 70) return theme.palette.warning.main;
    return theme.palette.success.main;
  };
  
  const loadColor = getLoadColor(loadPercentage);
  
  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Grid container spacing={3}>
        {/* Блок нагрузки */}
        <Grid item xs={12} md={4}>
          <Paper
            component={motion.div}
            variants={countVariants}
            initial="initial"
            animate="animate"
            elevation={0}
            sx={{
              p: 2,
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${alpha(loadColor, 0.2)}`,
              bgcolor: alpha(loadColor, 0.05)
            }}
          >
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessCenterIcon fontSize="small" sx={{ mr: 1, color: loadColor }} />
                Нагрузка
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography 
                  variant="h4" 
                  fontWeight="bold" 
                  color={loadColor}
                  component={motion.div}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {Math.round(loadPercentage)}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({currentLoad}/{capacity})
                </Typography>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={loadPercentage}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  mt: 1,
                  bgcolor: alpha(loadColor, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 1,
                    bgcolor: loadColor
                  }
                }}
              />
              
              <Typography variant="caption" color="text.secondary">
                {loadPercentage >= 90 ? 'Высокая нагрузка' : 
                 loadPercentage >= 70 ? 'Средняя нагрузка' : 
                 'Нормальная нагрузка'}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        
        {/* Блок KPI и конверсии */}
        <Grid item xs={12} md={4}>
          <Paper
            component={motion.div}
            variants={countVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
            elevation={0}
            sx={{
              p: 2,
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              bgcolor: alpha(theme.palette.primary.main, 0.05)
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SpeedIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                  KPI
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress
                    variant="determinate"
                    value={stats?.kpi || 0}
                    size={40}
                    thickness={4}
                    sx={{ 
                      color: theme.palette.primary.main,
                      mr: 2
                    }}
                  />
                  
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {stats?.kpi || 0}%
                    </Typography>
                    
                    {stats?.kpiTrend && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {stats.kpiTrend > 0 ? (
                          <TrendingUpIcon fontSize="small" color="success" />
                        ) : (
                          <TrendingDownIcon fontSize="small" color="error" />
                        )}
                        <Typography 
                          variant="caption" 
                          color={stats.kpiTrend > 0 ? 'success.main' : 'error.main'}
                        >
                          {stats.kpiTrend > 0 ? '+' : ''}{stats.kpiTrend}% за месяц
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: theme.palette.success.main }} />
                  Конверсия
                </Typography>
                
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {stats?.conversion || 0}%
                  </Typography>
                  
                  <Tooltip title="Процент успешного закрытия сделок">
                    <Chip 
                      label={`${stats?.closedDeals || 0}/${stats?.totalDeals || 0}`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Tooltip>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        
        {/* Блок сделок */}
        <Grid item xs={12} md={4}>
          <Paper
            component={motion.div}
            variants={countVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
            elevation={0}
            sx={{
              p: 2,
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              bgcolor: alpha(theme.palette.success.main, 0.05)
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoneyIcon fontSize="small" sx={{ mr: 1, color: theme.palette.success.main }} />
                Сделки
              </Typography>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Потенциальная сумма в работе:
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {formatCurrency(totalPotentialAmount)}
                </Typography>
              </Box>
              
              {stats?.averageCheck && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Средний чек:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatCurrency(stats.averageCheck)}
                  </Typography>
                </Box>
              )}
              
              {stats?.highPriorityLeads > 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 1, 
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.error.main, 0.1)
                }}>
                  <PriorityHighIcon fontSize="small" color="error" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {stats.highPriorityLeads} {stats.highPriorityLeads === 1 ? 
                      'высокоприоритетный лид' : 
                      (stats.highPriorityLeads < 5 ? 
                        'высокоприоритетных лида' : 
                        'высокоприоритетных лидов')}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

EmployeeMetrics.propTypes = {
  loadPercentage: PropTypes.number.isRequired,
  currentLoad: PropTypes.number.isRequired,
  capacity: PropTypes.number.isRequired,
  stats: PropTypes.object,
  totalPotentialAmount: PropTypes.number,
  formatCurrency: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired
};