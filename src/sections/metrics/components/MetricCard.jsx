// src/sections/metrics/components/MetricCard.jsx
import PropTypes from 'prop-types';
import { 
  Box, 
  Card, 
  Typography, 
  LinearProgress,
  Tooltip,
  Stack,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { m } from 'framer-motion';

export default function MetricCard({ 
  title, 
  value, 
  trend = 0, 
  description, 
  icon, 
  bgColor,
  showProgress = true,
  extraValue = null,
  extraLabel = null,
  tooltipTitle = '',
  sx
}) {
  const theme = useTheme();
  
  // Функция определения статуса метрики на основе значения
  const getStatus = (val) => {
    if (val >= 80) return 'Хорошо';
    if (val >= 60) return 'Хорошо';
    if (val >= 40) return 'Удовлетво';
    return 'Плохо';
  };
  
  // Функция определения цвета на основе статуса
  const getStatusColor = (status) => {
    switch(status) {
      case 'Хорошо':
        return theme.palette.success.main;
      case 'Удовлетво':
        return theme.palette.warning.main;
      case 'Плохо':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };
  
  // Определение статуса для этой метрики
  const status = typeof value === 'number' ? getStatus(value) : '';
  const statusColor = getStatusColor(status);
  
  // Определение текста и цвета тренда
  const trendText = trend > 0 ? `↑ ${trend}% за месяц` : trend < 0 ? `↓ ${Math.abs(trend)}% за месяц` : '0% за месяц';
  const trendColor = trend > 0 ? theme.palette.success.main : trend < 0 ? theme.palette.error.main : theme.palette.text.secondary;
  
  return (
    <Tooltip title={tooltipTitle} arrow>
      <Card
        component={m.div}
        whileHover={{ y: -5, boxShadow: theme.customShadows?.z16 || '0 16px 32px 0 rgba(145, 158, 171, 0.24)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{ 
          p: 3,
          height: '100%',
          boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          ...sx
        }}
      >
        {/* Декоративный градиент */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 100,
            height: 100,
            background: `radial-gradient(circle at top right, ${alpha(bgColor || theme.palette.primary.main, 0.12)}, transparent 70%)`,
            pointerEvents: 'none'
          }}
        />
        
        {/* Заголовок и иконка */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
            {title}
          </Typography>
          
          <Box
            sx={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: alpha(bgColor || theme.palette.primary.main, 0.12),
              color: bgColor || theme.palette.primary.main,
              fontSize: 20
            }}
          >
            {icon}
          </Box>
        </Stack>
        
        {/* Значение метрики */}
        <Stack direction="row" alignItems="flex-end" spacing={1} mb={1}>
          {typeof value === 'number' ? (
            <Typography variant="h3" component="div" fontWeight="bold" color={bgColor || theme.palette.text.primary}>
              {Math.round(value)}%
            </Typography>
          ) : (
            <Typography variant="h3" component="div" fontWeight="bold" color={bgColor || theme.palette.text.primary}>
              {value}
            </Typography>
          )}
          
          {status && (
            <Typography variant="body2" component="div" fontWeight="medium" color={statusColor} pb={1}>
              {status}
            </Typography>
          )}
        </Stack>
        
        {/* Тренд */}
        {trend !== null && trend !== undefined && (
          <Typography variant="body2" color={trendColor} mb={showProgress ? 1.5 : 0}>
            {trendText}
          </Typography>
        )}
        
        {/* Прогресс-бар */}
        {showProgress && typeof value === 'number' && (
          <Box sx={{ mt: 1, mb: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(value, 100)}
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: alpha(bgColor || theme.palette.primary.main, 0.12),
                '& .MuiLinearProgress-bar': {
                  bgcolor: bgColor || theme.palette.primary.main,
                }
              }}
            />
          </Box>
        )}
        
        {/* Дополнительная информация и описание */}
        {(extraValue && extraLabel) && (
          <Box sx={{ mt: 1, mb: 1, borderTop: `1px dashed ${theme.palette.divider}`, pt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {extraLabel}
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              {extraValue}
            </Typography>
          </Box>
        )}
        
        {description && (
          <Typography 
            variant="caption" 
            component="div" 
            color="text.secondary"
            sx={{ 
              mt: (extraValue && extraLabel) ? 0 : 'auto',
              pt: (extraValue && extraLabel) ? 0 : 1
            }}
          >
            {description}
          </Typography>
        )}
      </Card>
    </Tooltip>
  );
}

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  trend: PropTypes.number,
  description: PropTypes.string,
  icon: PropTypes.node,
  bgColor: PropTypes.string,
  showProgress: PropTypes.bool,
  extraValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  extraLabel: PropTypes.string,
  tooltipTitle: PropTypes.string,
  sx: PropTypes.object
};