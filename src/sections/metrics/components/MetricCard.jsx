// src/sections/metrics/components/MetricCard.jsx
import PropTypes from 'prop-types';
import { Box, Card, CardContent, Stack, Typography, Tooltip, CircularProgress } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { fPercent } from 'src/utils/format-number';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';

// Получение цвета в зависимости от значения метрики
const getMetricColor = (value, theme) => {
  if (value >= 80) return theme.palette.success.main;
  if (value >= 60) return theme.palette.warning.main;
  return theme.palette.error.main;
};

const getMetricLabel = (value) => {
  if (value >= 80) return 'Отлично';
  if (value >= 60) return 'Хорошо';
  return 'Требует улучшения';
};

export default function MetricCard({ 
  title, 
  value, 
  trend, 
  description, 
  icon, 
  bgColor, 
  showProgress = true,
  tooltipTitle,
  extraValue,
  extraLabel
}) {
  const theme = useTheme();
  
  const metricColor = getMetricColor(value, theme);
  
  // Если иконки не импортированы, используем простые символы
  const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : null;
  const trendColor = trend > 0 ? theme.palette.success.main : trend < 0 ? theme.palette.error.main : 'inherit';
  
  return (
    <AnimatePresence>
      <Card
        component={m.div}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{ 
          height: '100%', 
          position: 'relative',
          overflow: 'hidden',
          boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
          borderRadius: 2,
          '&:hover': {
            boxShadow: theme.customShadows?.z16 || '0 16px 32px 0 rgba(145, 158, 171, 0.24)'
          },
          transition: 'box-shadow 0.3s'
        }}
      >
        {bgColor && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(bgColor, 0.12)} 0%, ${alpha(bgColor, 0.04)} 60%)`,
              zIndex: 0
            }}
          />
        )}
        <CardContent sx={{ height: '100%', position: 'relative', zIndex: 1, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Tooltip title={tooltipTitle || ''} arrow placement="top">
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {title}
              </Typography>
            </Tooltip>
            {icon && (
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: bgColor ? alpha(bgColor, 0.12) : theme.palette.grey[100],
                  color: bgColor || theme.palette.primary.main
                }}
              >
                {icon}
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {showProgress && (
              <Box sx={{ position: 'relative', mr: 2, display: 'flex' }}>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={56}
                  thickness={4}
                  sx={{ color: alpha(theme.palette.grey[500], 0.16) }}
                />
                <CircularProgress
                  variant="determinate"
                  value={value}
                  size={56}
                  thickness={4}
                  sx={{ 
                    color: metricColor,
                    position: 'absolute',
                    left: 0,
                    top: 0
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" component="div" sx={{ 
                    fontWeight: 'bold', 
                    color: metricColor
                  }}>
                    {Math.round(value)}%
                  </Typography>
                </Box>
              </Box>
            )}
            
            <Box>
              <Typography variant={showProgress ? "h5" : "h3"} sx={{ 
                color: metricColor,
                fontWeight: 'bold',
                mb: 0.5
              }}>
                {showProgress ? getMetricLabel(value) : fPercent(value / 100)}
              </Typography>
              
              {trend !== undefined && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {trendIcon && (
                    <Box 
                      component={m.div}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      sx={{ color: trendColor }}
                    >
                      {trendIcon}
                    </Box>
                  )}
                  <Typography 
                    variant="body2" 
                    component={m.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    sx={{ 
                      color: trendColor, 
                      fontWeight: 'medium' 
                    }}
                  >
                    {Math.abs(trend)}%
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ color: 'text.secondary' }}
                  >
                    за месяц
                  </Typography>
                </Stack>
              )}
            </Box>
          </Box>
          
          {extraValue && extraLabel && (
            <Box sx={{ 
              mt: 2, 
              p: 1.5, 
              borderRadius: 1, 
              bgcolor: alpha(theme.palette.grey[500], 0.08) 
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {extraLabel}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {extraValue}
                </Typography>
              </Box>
            </Box>
          )}
          
          {description && (
            <Typography 
              variant="caption" 
              component={m.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              sx={{ 
                color: 'text.secondary', 
                display: 'block', 
                mt: extraValue ? 0 : 2
              }}
            >
              {description}
            </Typography>
          )}
        </CardContent>
      </Card>
    </AnimatePresence>
  );
}

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  trend: PropTypes.number,
  description: PropTypes.string,
  icon: PropTypes.node,
  bgColor: PropTypes.string,
  showProgress: PropTypes.bool,
  tooltipTitle: PropTypes.string,
  extraValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  extraLabel: PropTypes.string
};