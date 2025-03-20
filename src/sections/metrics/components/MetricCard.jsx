// src/sections/metrics/components/MetricCard.jsx
import PropTypes from 'prop-types';
import { 
  Box, 
  Card,
  Typography,
  CircularProgress,
  Tooltip,
  Stack,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { m } from 'framer-motion';

export default function MetricCard({
  title,
  value,
  trend,
  description,
  icon,
  bgColor,
  showProgress = true,
  extraValue,
  extraLabel,
  tooltipTitle
}) {
  const theme = useTheme();
  
  // Determine status based on value
  const getStatus = (val) => {
    if (val >= 80) return 'Отлично';
    if (val >= 65) return 'Хорошо';
    if (val >= 50) return 'Удовлетворительно';
    return 'Требует улучшения';
  };
  
  // Determine color for trend indicator
  const getTrendColor = (val) => {
    if (val > 0) return theme.palette.success.main;
    if (val < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };
  
  // Determine sign for trend indicator
  const getTrendSign = (val) => {
    if (val > 0) return '↑';
    if (val < 0) return '↓';
    return '';
  };
  
  return (
    <Tooltip title={tooltipTitle || description} placement="top">
      <Card
        component={m.div}
        whileHover={{ 
          y: -8,
          boxShadow: theme.customShadows?.z16 || '0 12px 24px 0 rgba(145, 158, 171, 0.24)',
          transition: { duration: 0.3 }
        }}
        sx={{
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
          bgcolor: theme.palette.background.paper,
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: bgColor,
            opacity: 0.8
          }
        }}
      >
        {/* Background Gradient */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40%',
            height: '100%',
            background: `linear-gradient(135deg, ${alpha(bgColor, 0.05)} 0%, ${alpha(bgColor, 0)} 50%)`,
            zIndex: 0
          }}
        />
        
        {/* Title and Icon */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          position: 'relative',
          zIndex: 1
        }}>
          <Typography variant="h6" fontWeight="600" sx={{ color: bgColor }}>
            {title}
          </Typography>
          
          <Box
            component={m.div}
            whileHover={{ scale: 1.1, rotate: 5 }}
            sx={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              bgcolor: alpha(bgColor, 0.12),
              color: bgColor,
              fontSize: '1.4rem',
              boxShadow: `0 0 0 4px ${alpha(bgColor, 0.05)}`
            }}
          >
            {icon}
          </Box>
        </Box>
        
        {/* Main Content */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          position: 'relative',
          zIndex: 1
        }}>
          {showProgress && (
            <Box 
              component={m.div}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              sx={{ position: 'relative', display: 'inline-flex', mr: 3 }}
            >
              <CircularProgress
                variant="determinate"
                value={100}
                size={76}
                thickness={4}
                sx={{
                  color: alpha(bgColor, 0.12),
                  position: 'absolute'
                }}
              />
              <CircularProgress
                variant="determinate"
                value={value}
                size={76}
                thickness={5}
                sx={{
                  color: bgColor,
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                    transition: 'stroke-dashoffset 1s ease-in-out',
                  },
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="h5"
                  component={m.div}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  fontWeight="bold"
                  sx={{ fontSize: '1.2rem' }}
                >
                  {value}%
                </Typography>
              </Box>
            </Box>
          )}
          
          <Box>
            <Typography 
              variant="h4" 
              component={m.div}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              fontWeight="bold"
              color={showProgress ? 'text.primary' : bgColor}
            >
              {showProgress ? getStatus(value) : (extraValue || value)}
            </Typography>
            
            {trend !== undefined && (
              <Box 
                component={m.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    color: getTrendColor(trend),
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 500
                  }}
                >
                  <Box 
                    component={m.span}
                    animate={{ 
                      y: trend > 0 ? [0, -3, 0] : (trend < 0 ? [0, 3, 0] : 0) 
                    }}
                    transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.5 }}
                    sx={{ mr: 0.5, display: 'inline-block' }}
                  >
                    {getTrendSign(trend)}
                  </Box> 
                  {Math.abs(trend)}% за месяц
                </Typography>
              </Box>
            )}
            
            {extraLabel && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mt: 0.5 }}
              >
                {extraLabel}
              </Typography>
            )}
          </Box>
        </Box>
        
        {/* Description */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mt: 'auto', position: 'relative', zIndex: 1 }}
        >
          {description}
        </Typography>
      </Card>
    </Tooltip>
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
  extraValue: PropTypes.string,
  extraLabel: PropTypes.string,
  tooltipTitle: PropTypes.string
};