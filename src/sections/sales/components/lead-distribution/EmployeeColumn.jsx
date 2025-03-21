// src/sections/sales/components/lead-distribution/EmployeeColumnEnhanced.jsx
import PropTypes from 'prop-types';
import { Droppable } from 'react-beautiful-dnd';
import {
  Box,
  Card,
  Typography,
  Divider,
  CardHeader,
  CardContent,
  Avatar,
  alpha,
  LinearProgress,
  Tooltip,
  Chip,
  IconButton,
  Stack,
  Badge
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

// Импортируем улучшенную карточку лида
import LeadCard from './LeadCard';

// Заглушки для иконок
const Icons = {
  Person: '👤',
  Info: 'ℹ️',
  Settings: '⚙️',
  Warning: '⚠️',
  Success: '✅',
  Star: '⭐',
  Money: '💰',
  Trending: '📈',
};

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

/**
 * Улучшенная колонка для сотрудника
 */
export default function EmployeeColumn({ employee, leads, isDropDisabled, onActionLead, onEmployeeAction }) {
  const theme = useTheme();
  
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
  
  // Обработчик действий сотрудника
  const handleEmployeeAction = (action) => {
    if (onEmployeeAction) {
      onEmployeeAction(employee.id, action);
    }
  };
  
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            boxShadow: theme.shadows[1],
            border: `1px solid ${snapshot.isDraggingOver ? theme.palette.primary.main : theme.palette.divider}`,
            bgcolor: snapshot.isDraggingOver ? alpha(theme.palette.primary.main, 0.05) : 'background.paper'
          }}
        >
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={employee.avatar} 
                  alt={employee.name}
                  sx={{ 
                    width: 36, 
                    height: 36, 
                    mr: 1.5,
                    bgcolor: employee.color || theme.palette.primary.main,
                    boxShadow: `0 0 0 2px ${alpha(employee.color || theme.palette.primary.main, 0.2)}`
                  }}
                >
                  {employee.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                    {employee.name}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Box component="span" sx={{ mr: 0.5, fontSize: '0.7rem' }}>
                        {Icons.Person}
                      </Box>
                      {employee.role}
                    </Typography>
                    
                    <Chip 
                      label={employee.level} 
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                  </Stack>
                </Box>
              </Box>
            }
            action={
              <IconButton
                size="small"
                onClick={() => handleEmployeeAction('settings')}
                color="primary"
              >
                {Icons.Settings}
              </IconButton>
            }
            sx={{
              p: 2,
              pb: 1,
              '& .MuiCardHeader-action': { m: 0 }
            }}
          />
          
          <Box sx={{ px: 2, pb: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
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
                />
              </Badge>
            </Stack>
            
            {/* Метрики сотрудника */}
            {totalPotentialAmount > 0 && (
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{ 
                  mt: 1, 
                  p: 1, 
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  border: `1px dashed ${alpha(theme.palette.info.main, 0.2)}`,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      mr: 0.75, 
                      color: theme.palette.success.main,
                      fontSize: '0.9rem'
                    }}
                  >
                    {Icons.Money}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Потенциал:
                  </Typography>
                </Box>
                <Typography 
                  variant="caption" 
                  fontWeight="bold" 
                  color="success.main"
                >
                  {totalPotentialAmount.toLocaleString()} ₸
                </Typography>
              </Box>
            )}
          </Box>
          
          <Divider />
          
          <CardContent 
            sx={{ 
              flexGrow: 1, 
              p: 2,
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
                    onAction={onActionLead}
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
                    Перетащите лидов или используйте автоматическое распределение
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

EmployeeColumn.propTypes = {
  employee: PropTypes.object.isRequired,
  leads: PropTypes.array.isRequired,
  isDropDisabled: PropTypes.bool,
  onActionLead: PropTypes.func,
  onEmployeeAction: PropTypes.func
};