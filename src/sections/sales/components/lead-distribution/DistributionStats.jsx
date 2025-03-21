// src/sections/sales/components/lead-distribution/DistributionStats.jsx
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  CardContent,
  Skeleton,
  alpha,
  Chip,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Импортируем иконки
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import TimelineIcon from '@mui/icons-material/Timeline';
import ShowChartIcon from '@mui/icons-material/ShowChart';

// Анимации для элементов
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};

// Анимации для чисел
const countVariants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15
    }
  }
};

/**
 * Компонент прогресс-бара с текстовым описанием
 */
const StatProgressBar = ({ current, total, title, color, icon }) => {
  const theme = useTheme();
  const progress = Math.min((current / total) * 100, 100);
  
  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Box 
          sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '50%',
            bgcolor: alpha(color, 0.1),
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <Typography 
              component={motion.span}
              variants={countVariants}
              initial="initial"
              animate="animate"
              variant="h5" 
              fontWeight="bold"
            >
              {current}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              из {total}
            </Typography>
          </Box>
        </Box>
        <Typography 
          variant="body2" 
          fontWeight="bold" 
          color={color}
        >
          {Math.round(progress)}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 2,
          bgcolor: alpha(color, 0.1),
          '& .MuiLinearProgress-bar': {
            borderRadius: 2,
            bgcolor: color
          }
        }}
      />
    </Box>
  );
};

StatProgressBar.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  icon: PropTypes.node
};

/**
 * Компонент карточки сотрудника с кратким обзором
 */
const EmployeeStatCard = ({ employee, onClick }) => {
  const theme = useTheme();
  
  // Получение цвета для загрузки
  const getLoadColor = (utilization) => {
    if (utilization >= 0.9) return theme.palette.error.main;
    if (utilization >= 0.7) return theme.palette.warning.main;
    return theme.palette.success.main;
  };
  
  const loadPercentage = Math.min(100, employee.utilization * 100);
  const loadColor = getLoadColor(employee.utilization);
  
  // Получение цвета для оценки назначения
  const getAssignmentScoreColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.info.main;
    if (score >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  // Получение рейтинга оценки назначения
  const assignmentScore = employee.leadAssignmentScore || 0;
  const assignmentScoreColor = getAssignmentScoreColor(assignmentScore);
  
  return (
    <Box 
      component={motion.div}
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
      onClick={() => onClick && onClick(employee.id)}
      sx={{ 
        p: 1.5, 
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        borderRadius: 2,
        cursor: 'pointer',
        bgcolor: 'background.paper',
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          borderColor: alpha(theme.palette.primary.main, 0.2)
        }
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar 
          src={employee.avatar} 
          alt={employee.name}
          sx={{ 
            width: 40, 
            height: 40,
            bgcolor: employee.color || theme.palette.primary.main
          }}
        >
          {employee.name?.charAt(0) || 'U'}
        </Avatar>
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {employee.name}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={loadPercentage}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: alpha(loadColor, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    bgcolor: loadColor
                  }
                }}
              />
            </Box>
            <Tooltip title="Загрузка сотрудника">
              <Typography variant="caption" fontWeight="bold" color={loadColor}>
                {Math.round(loadPercentage)}%
              </Typography>
            </Tooltip>
          </Stack>
        </Box>
        
        <Tooltip title={`Приоритет назначения: ${assignmentScore}/100`}>
          <Box 
            sx={{ 
              width: 28, 
              height: 28, 
              borderRadius: '50%',
              bgcolor: alpha(assignmentScoreColor, 0.1),
              color: assignmentScoreColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 'bold'
            }}
          >
            {assignmentScore}
          </Box>
        </Tooltip>
      </Stack>
    </Box>
  );
};

EmployeeStatCard.propTypes = {
  employee: PropTypes.object.isRequired,
  onClick: PropTypes.func
};

/**
 * Улучшенный компонент для отображения статистики распределения
 */
export default function DistributionStats({ 
  stats, 
  extendedStats, 
  isLoading, 
  showExtendedStats = false,
  onEmployeeClick 
}) {
  const theme = useTheme();
  
  if (isLoading) {
    return (
      <Card
        component={motion.div}
        variants={itemVariants}
        sx={{
          borderRadius: 2,
          boxShadow: theme.shadows[4],
          mb: 3,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={3}>
            {[...Array(4)].map((_, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }
  
  if (!stats) return null;
  
  // Дополнительные вычисления для углубленной статистики
  const potentialValue = extendedStats?.totalPotentialValue || 0;
  const assignedValuePercentage = extendedStats?.assignedValuePercentage || 0;
  
  return (
    <Card
      component={motion.div}
      variants={itemVariants}
      sx={{
        borderRadius: 2,
        boxShadow: theme.shadows[4],
        mb: 3,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Основная статистика */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <StatProgressBar
                  current={stats.assigned}
                  total={stats.total}
                  title="Распределено лидов"
                  color={theme.palette.primary.main}
                  icon={<AssignmentTurnedInIcon />}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <StatProgressBar
                  current={stats.unassigned}
                  total={stats.total}
                  title="Не распределено"
                  color={stats.unassigned > 0 ? theme.palette.warning.main : theme.palette.success.main}
                  icon={<AssignmentLateIcon />}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <StatProgressBar
                  current={stats.byPriority.high}
                  total={stats.total}
                  title="Высокий приоритет"
                  color={theme.palette.error.main}
                  icon={<PriorityHighIcon />}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <StatProgressBar
                  current={extendedStats?.urgentRequireAction || 0}
                  total={stats.total}
                  title="Срочные (до 24ч)"
                  color={theme.palette.secondary.main}
                  icon={<HourglassEmptyIcon />}
                />
              </Grid>
            </Grid>
          </Grid>
          
          {/* Дополнительная статистика и тренды */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ 
              bgcolor: alpha(theme.palette.info.main, 0.03),
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              height: '100%',
              p: 2,
              borderRadius: 1
            }}>
              <Stack spacing={2}>
                <Typography variant="subtitle1" gutterBottom>
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                    <AutoGraphIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                    Тренды и аналитика
                  </Box>
                </Typography>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Потенциальная стоимость всех лидов:
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="info.main">
                    {new Intl.NumberFormat('ru-RU', {
                      style: 'currency',
                      currency: 'KZT',
                      maximumFractionDigits: 0
                    }).format(potentialValue)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Распределено по стоимости:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LinearProgress
                      variant="determinate"
                      value={assignedValuePercentage}
                      sx={{
                        height: 8,
                        borderRadius: 2,
                        flexGrow: 1,
                        mr: 1,
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2,
                          bgcolor: theme.palette.info.main
                        }
                      }}
                    />
                    <Typography variant="body2" fontWeight="bold" color="info.main">
                      {Math.round(assignedValuePercentage)}%
                    </Typography>
                  </Box>
                </Box>
                
                <Divider />
                
                <Stack direction="row" spacing={2} justifyContent="space-between">
                  <Box sx={{ textAlign: 'center' }}>
                    <Tooltip title="Тренд распределения за неделю">
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: theme.palette.success.main
                        }}
                      >
                        <TrendingUpIcon />
                        <Typography variant="h6" fontWeight="bold" sx={{ ml: 0.5 }}>
                          +12%
                        </Typography>
                      </Box>
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary">
                      за неделю
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Tooltip title="Среднее время назначения">
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center'
                        }}
                      >
                        <TimelineIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold" sx={{ ml: 0.5 }}>
                          4ч
                        </Typography>
                      </Box>
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary">
                      до назначения
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Card>
          </Grid>
          
          {/* Секция сотрудников - показывается только при включенном showExtendedStats */}
          {showExtendedStats && extendedStats?.employeeDetails && (
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                    <PeopleIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    Сотрудники и распределение
                  </Box>
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {extendedStats.employeeDetails
                    .sort((a, b) => b.leadAssignmentScore - a.leadAssignmentScore)
                    .map((employee) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={employee.id}>
                        <EmployeeStatCard 
                          employee={employee} 
                          onClick={onEmployeeClick}
                        />
                      </Grid>
                    ))}
                </Grid>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}

DistributionStats.propTypes = {
  stats: PropTypes.object,
  extendedStats: PropTypes.object,
  isLoading: PropTypes.bool,
  showExtendedStats: PropTypes.bool,
  onEmployeeClick: PropTypes.func
};