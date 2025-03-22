// src/sections/sales/components/lead-distribution/UnassignedLeadsColumn.jsx
import PropTypes from 'prop-types';
import { Droppable } from 'react-beautiful-dnd';
import {
  Box,
  Card,
  Typography,
  Divider,
  CardHeader,
  CardContent,
  Badge,
  alpha,
  Chip,
  Button,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

// Material UI иконки
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SortIcon from '@mui/icons-material/Sort';
import WarningIcon from '@mui/icons-material/Warning';

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

// Анимации для элементов
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

/**
 * Улучшенная колонка для нераспределенных лидов
 */
export default function UnassignedLeadsColumn({ 
  leads, 
  compactView = false,
  showDetails = true,
  isLoading = false,
  onAddClick,
  onActionLead,
  onFilterClick,
  onSortClick
}) {
  const theme = useTheme();
  
  // Фильтр лидов по приоритету
  const highPriorityLeads = leads.filter(lead => lead.priority === 'Высокий');
  const normalPriorityLeads = leads.filter(lead => lead.priority !== 'Высокий');
  
  // Получение лидов с приближающимся дедлайном (в течение 24 часов)
  const getUrgentLeads = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return leads.filter(lead => {
      const deadlineParts = lead.contact_deadline.split('.');
      const deadline = new Date(`${deadlineParts[2]}-${deadlineParts[1]}-${deadlineParts[0]}`);
      return deadline <= tomorrow;
    });
  };
  
  const urgentLeads = getUrgentLeads();
  
  // Сортировка лидов по дедлайну (ближайшие сверху)
  const sortedLeads = [...leads].sort((a, b) => {
    // Сначала по приоритету
    if (a.priority === 'Высокий' && b.priority !== 'Высокий') return -1;
    if (a.priority !== 'Высокий' && b.priority === 'Высокий') return 1;
    
    // Затем по дедлайну
    const dateA = new Date(a.contact_deadline.split('.').reverse().join('-'));
    const dateB = new Date(b.contact_deadline.split('.').reverse().join('-'));
    return dateA - dateB;
  });
  
  return (
    <Card 
      component={motion.div}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      sx={{ 
        borderRadius: 2,
        boxShadow: theme.shadows[4],
        bgcolor: alpha(theme.palette.warning.main, 0.05),
        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              badgeContent={leads.length}
              color="warning"
              max={99}
              showZero
              sx={{ 
                '& .MuiBadge-badge': {
                  fontSize: '0.75rem',
                  height: 20,
                  minWidth: 20
                }
              }}
            >
              <WarningIcon color="warning" sx={{ mr: 1 }} />
            </Badge>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              Нераспределенные лиды
            </Typography>
          </Box>
        }
        action={
          <Stack direction="row" spacing={1}>
            {onFilterClick && (
              <Tooltip title="Фильтровать лиды">
                <IconButton 
                  size="small"
                  onClick={onFilterClick}
                  color="primary"
                >
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            )}
            
            {onSortClick && (
              <Tooltip title="Сортировать лиды">
                <IconButton 
                  size="small"
                  onClick={onSortClick}
                  color="primary"
                >
                  <SortIcon />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Добавить новый лид">
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                onClick={onAddClick}
              >
                Добавить
              </Button>
            </Tooltip>
          </Stack>
        }
        sx={{
          p: 2,
          pb: 1,
          '& .MuiCardHeader-action': { m: 0 }
        }}
      />
      
      {/* Статистика нераспределенных лидов */}
      <Box sx={{ px: 2 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Tooltip title="Лиды высокого приоритета">
            <Chip 
              icon={<PriorityHighIcon />}
              label={`${highPriorityLeads.length} высокий приоритет`}
              color="error"
              size="small"
              variant={highPriorityLeads.length > 0 ? "filled" : "outlined"}
            />
          </Tooltip>
          
          <Tooltip title="Срочные лиды (дедлайн в течение 24 часов)">
            <Chip 
              icon={<HourglassEmptyIcon />}
              label={`${urgentLeads.length} срочные`}
              color="secondary"
              size="small"
              variant={urgentLeads.length > 0 ? "filled" : "outlined"}
            />
          </Tooltip>
        </Stack>
      </Box>
      
      <Divider />
      
      {/* Контент с лидами */}
      <CardContent 
        sx={{ 
          flexGrow: 1, 
          p: theme.spacing(compactView ? 1 : 2),
          overflowY: 'auto',
          bgcolor: alpha(theme.palette.background.default, 0.5),
          minHeight: 300,
          maxHeight: 500
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Droppable droppableId="unassigned">
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                component={motion.div}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                sx={{
                  minHeight: 200,
                  borderRadius: 1,
                  bgcolor: snapshot.isDraggingOver ? alpha(theme.palette.warning.main, 0.1) : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <AnimatePresence>
                  {/* Высокоприоритетные лиды сверху */}
                  {highPriorityLeads.length > 0 && showDetails && (
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label="Высокий приоритет" 
                        color="error"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      {highPriorityLeads.map((lead, index) => (
                        <LeadCard
                          key={lead.id} 
                          lead={lead} 
                          index={index} 
                          isDragging={snapshot.isDraggingOver} 
                          compactView={compactView}
                          onAction={onActionLead}
                        />
                      ))}
                    </Box>
                  )}
                  
                  {/* Срочные лиды */}
                  {urgentLeads.length > 0 && showDetails && 
                   urgentLeads.some(lead => lead.priority !== 'Высокий') && (
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label="Срочные (до 24ч)" 
                        color="secondary"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      {urgentLeads
                        .filter(lead => lead.priority !== 'Высокий') // Исключаем высокоприоритетные, которые уже показаны выше
                        .map((lead, index) => (
                          <LeadCard
                            key={lead.id} 
                            lead={lead} 
                            index={highPriorityLeads.length + index} 
                            isDragging={snapshot.isDraggingOver}
                            compactView={compactView}
                            onAction={onActionLead}
                          />
                      ))}
                    </Box>
                  )}
                  
                  {/* Остальные лиды */}
                  {normalPriorityLeads.length > 0 && (
                    <Box>
                      {!showDetails && (
                        <Chip 
                          label="Все лиды" 
                          color="default"
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      )}
                      
                      {showDetails ? (
                        // Если показываем детали, то отображаем только те лиды,
                        // которые еще не показаны в секциях выше
                        normalPriorityLeads
                          .filter(lead => {
                            const deadlineParts = lead.contact_deadline.split('.');
                            const deadline = new Date(`${deadlineParts[2]}-${deadlineParts[1]}-${deadlineParts[0]}`);
                            const now = new Date();
                            const tomorrow = new Date(now);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            
                            return deadline > tomorrow; // Не срочные
                          })
                          .map((lead, index) => (
                            <LeadCard
                              key={lead.id} 
                              lead={lead} 
                              index={highPriorityLeads.length + urgentLeads.length + index} 
                              isDragging={snapshot.isDraggingOver}
                              compactView={compactView}
                              onAction={onActionLead}
                            />
                          ))
                      ) : (
                        // Если не показываем детали, то просто отображаем все лиды подряд
                        sortedLeads.map((lead, index) => (
                          <LeadCard
                            key={lead.id} 
                            lead={lead} 
                            index={index} 
                            isDragging={snapshot.isDraggingOver}
                            compactView={compactView}
                            onAction={onActionLead}
                          />
                        ))
                      )}
                    </Box>
                  )}
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
                      Все лиды распределены
                    </Typography>
                    <Typography variant="caption" textAlign="center">
                      Нет нераспределенных лидов на данный момент
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<AddIcon />}
                      onClick={onAddClick}
                      sx={{ mt: 2 }}
                    >
                      Добавить лид
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Droppable>
        )}
      </CardContent>
    </Card>
  );
}

UnassignedLeadsColumn.propTypes = {
  leads: PropTypes.array.isRequired,
  compactView: PropTypes.bool,
  showDetails: PropTypes.bool,
  isLoading: PropTypes.bool,
  onAddClick: PropTypes.func,
  onActionLead: PropTypes.func,
  onFilterClick: PropTypes.func,
  onSortClick: PropTypes.func
};