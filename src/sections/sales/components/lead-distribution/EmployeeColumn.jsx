// src/sections/sales/components/lead-distribution/EnhancedEmployeeColumn.jsx
import PropTypes from 'prop-types';
import { Droppable } from 'react-beautiful-dnd';
import {
  Box,
  Card,
  Stack,
  Typography,
  Divider,
  CardContent,
  Avatar,
  alpha,
  LinearProgress,
  Tooltip,
  Chip,
  IconButton,
  Badge,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

// Импортируем иконки
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import MoneyIcon from '@mui/icons-material/Money';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

// Импортируем улучшенную карточку лида
import LeadCard from './LeadCard';

// Анимации для контейнера
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

/**
 * Компонент для отображения рейтинга в виде звезд
 */


/**
 * Улучшенная колонка для сотрудника с дополнительными метриками и визуализацией
 */
export default function EmployeeColumn({ 
  employee, 
  leads, 
  metrics, 
  isDropDisabled,
  compactView = false,
  showMetrics = true,
  showAssignmentScore = true,
  onEmployeeClick
}) {
  const theme = useTheme();
  const StarRating = ({ value, max = 5 }) => {
    const stars = [];
    
    // Преобразуем оценку в шкалу от 1 до 5
    const normalizedValue = Math.max(1, Math.min(5, Math.round(value * 5 / 100)));
    
    for (let i = 0; i < max; i++) {
      stars.push(
        <Box component="span" key={i} sx={{ color: i < normalizedValue ? theme.palette.warning.main : alpha(theme.palette.warning.main, 0.3) }}>
          {i < normalizedValue ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
        </Box>
      );
    }
    
    return <Box sx={{ display: 'flex' }}>{stars}</Box>;
  };
  
  StarRating.propTypes = {
    value: PropTypes.number.isRequired,
    max: PropTypes.number
  };
  // Расчет нагрузки
  const calculatedLoad = leads.length;
  const maxLoad = employee.capacity || 10;
  const loadPercentage = Math.min(100, (calculatedLoad / maxLoad) * 100);
  
  // Определение цвета для нагрузки
  const getLoadColor = (percentage) => {
    if (percentage >= 90) return theme.palette.error.main;
    if (percentage >= 70) return theme.palette.warning.main;
    return theme.palette.success.main;
  };
  
  const loadColor = getLoadColor(loadPercentage);
  
  // Получение суммы потенциальных сделок
  const totalPotentialAmount = leads.reduce((sum, lead) => sum + lead.potential_amount, 0);
  
  // Получение количества высокоприоритетных лидов
  const highPriorityCount = leads.filter(lead => lead.priority === 'Высокий').length;
  
  // Получение оценки назначения сотрудника
  const assignmentScore = metrics?.leadAssignmentScore || 0;
  
  // Определение цвета для оценки назначения
  const getAssignmentScoreColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.info.main;
    if (score >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  const assignmentScoreColor = getAssignmentScoreColor(assignmentScore);
  
  // Получение индикатора уровня
  const getLevelIndicator = (level) => {
    switch (level) {
      case 'Senior':
        return { color: theme.palette.error.main, stars: 3 };
      case 'Middle':
        return { color: theme.palette.info.main, stars: 2 };
      case 'Junior':
        return { color: theme.palette.success.main, stars: 1 };
      case 'Team Lead':
        return { color: theme.palette.secondary.main, stars: 4 };
      default:
        return { color: theme.palette.warning.main, stars: 1 };
    }
  };
  
  const levelIndicator = getLevelIndicator(employee.level);
  
  // Сортировка лидов по приоритету
  const sortedLeads = [...leads].sort((a, b) => {
    // Высокий приоритет всегда вверху
    if (a.priority === 'Высокий' && b.priority !== 'Высокий') return -1;
    if (a.priority !== 'Высокий' && b.priority === 'Высокий') return 1;
    
    // Затем сортируем по дедлайну
    const dateA = new Date(a.contact_deadline.split('.').reverse().join('-'));
    const dateB = new Date(b.contact_deadline.split('.').reverse().join('-'));
    return dateA - dateB;
  });
  
  // Форматирование суммы
  const formatCurrency = (amount) => (
      new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      maximumFractionDigits: 0
    }).format(amount)
  );
  
  return (
    <Droppable 
      droppableId={`employee-${employee.id}`} 
      isDropDisabled={isDropDisabled}
    >
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.droppableProps}
          component={motion.div}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            boxShadow: theme.shadows[snapshot.isDraggingOver ? 4 : 1],
            border: `1px solid ${snapshot.isDraggingOver ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1)}`,
            bgcolor: snapshot.isDraggingOver ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Фоновый элемент для выделения */}
          {assignmentScore >= 70 && showAssignmentScore && (
            <Box 
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 80,
                height: 80,
                background: `linear-gradient(135deg, transparent 50%, ${alpha(assignmentScoreColor, 0.2)} 50%)`,
                zIndex: 0
              }}
            />
          )}
          
          {/* Заголовок с информацией о сотруднике */}
          <Box 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative',
              zIndex: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Tooltip title={`Уровень: ${employee.level}`}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: levelIndicator.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        border: `2px solid ${theme.palette.background.paper}`
                      }}
                    >
                      {levelIndicator.stars}
                    </Box>
                  </Tooltip>
                }
              >
                <Avatar 
                  src={employee.avatar} 
                  alt={employee.name}
                  sx={{ 
                    width: 40, 
                    height: 40,
                    bgcolor: employee.color || theme.palette.primary.main,
                    boxShadow: `0 0 0 2px ${alpha(employee.color || theme.palette.primary.main, 0.2)}`
                  }}
                >
                  {employee.name.charAt(0)}
                </Avatar>
              </Badge>
              
              <Box sx={{ ml: 1.5, flex: 1 }}>
                <Typography variant="subtitle1" noWrap sx={{ fontWeight: 'medium' }}>
                  {employee.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {employee.role}
                </Typography>
              </Box>
              
              <IconButton 
                size="small" 
                color="primary"
                onClick={() => onEmployeeClick && onEmployeeClick(employee.id)}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Box>
            
            {/* Блок с метриками сотрудника */}
            {showMetrics && (
              <Box sx={{ mb: 1.5 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                  <Tooltip 
                    title={`Использовано ${calculatedLoad} из ${maxLoad} ячеек`} 
                    arrow
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Нагрузка</span>
                        <span style={{ color: loadColor, fontWeight: 'bold' }}>{Math.round(loadPercentage)}%</span>
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={loadPercentage}
                        sx={{
                          height: 6,
                          borderRadius: 1,
                          bgcolor: alpha(loadColor, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 1,
                            bgcolor: loadColor
                          }
                        }}
                      />
                    </Box>
                  </Tooltip>
                  
                  <Badge
                    badgeContent={highPriorityCount}
                    color="error"
                    showZero={false}
                    max={99}
                  >
                    <Chip
                      label={`${leads.length} лидов`}
                      size="small"
                      color={getLoadColor(loadPercentage) === theme.palette.success.main ? 'success' : 'warning'}
                      variant="outlined"
                      sx={{ height: 24, fontSize: '0.75rem' }}
                    />
                  </Badge>
                </Stack>
                
                {/* Оценка для назначения лидов */}
                {showAssignmentScore && (
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha(assignmentScoreColor, 0.05),
                      border: `1px dashed ${alpha(assignmentScoreColor, 0.2)}`,
                    }}
                  >
                    <Tooltip title="Оценка для назначения лидов (учитывает опыт, специализацию, нагрузку и KPI)">
                      <CircularProgress
                        variant="determinate"
                        value={assignmentScore}
                        size={28}
                        thickness={4}
                        sx={{ 
                          color: assignmentScoreColor,
                          '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                          }
                        }}
                      />
                    </Tooltip>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Приоритет назначения
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold" 
                        color={assignmentScoreColor}
                      >
                        {assignmentScore}/100
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {/* Метрики по эффективности, если доступны */}
                {metrics && !compactView && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {metrics.kpi && (
                      <Tooltip title="KPI">
                        <Chip
                          icon={<SpeedIcon fontSize="small" />}
                          label={`KPI: ${metrics.kpi}%`}
                          size="small"
                          variant="outlined"
                          color={metrics.kpi >= 80 ? 'success' : metrics.kpi >= 60 ? 'primary' : 'warning'}
                          sx={{ height: 24, fontSize: '0.75rem' }}
                        />
                      </Tooltip>
                    )}
                    
                    {metrics.conversionRate && (
                      <Tooltip title="Конверсия">
                        <Chip
                          icon={<CheckCircleIcon fontSize="small" />}
                          label={`${metrics.conversionRate}%`}
                          size="small"
                          variant="outlined"
                          color={metrics.conversionRate >= 25 ? 'success' : 'primary'}
                          sx={{ height: 24, fontSize: '0.75rem' }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
          
          <Divider />
          
          {/* Потенциальная сумма */}
          {totalPotentialAmount > 0 && (
            <>
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{ 
                  px: 2,
                  py: 1, 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: alpha(theme.palette.success.main, 0.05)
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <MoneyIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.success.main }} />
                  Потенциал:
                </Typography>
                <Typography 
                  variant="body2"
                  fontWeight="bold" 
                  color="success.main"
                >
                  {formatCurrency(totalPotentialAmount)}
                </Typography>
              </Box>
              <Divider />
            </>
          )}
          
          {/* Контент с лидами */}
          <CardContent 
            sx={{ 
              flexGrow: 1, 
              p: theme.spacing(compactView ? 1 : 2),
              overflowY: 'auto',
              bgcolor: alpha(theme.palette.background.default, 0.5),
              minHeight: 200,
              maxHeight: 500
            }}
          >
            <Box
              component={motion.div}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {sortedLeads.map((lead, index) => (
                  <LeadCard
                    key={lead.id} 
                    lead={lead} 
                    index={index} 
                    isDragging={snapshot.isDraggingOver}
                    compactView={compactView}
                  />
                ))}
              </AnimatePresence>
              
              {provided.placeholder}
              
              {leads.length === 0 && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 150,
                    p: 2,
                    borderRadius: 2,
                    border: `1px dashed ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                    color: 'text.secondary'
                  }}
                >
                  <Typography variant="body2" textAlign="center" gutterBottom>
                    Нет назначенных лидов
                  </Typography>
                  <Typography variant="caption" textAlign="center">
                    Перетащите лидов или используйте интеллектуальное распределение
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Droppable>
  );
}