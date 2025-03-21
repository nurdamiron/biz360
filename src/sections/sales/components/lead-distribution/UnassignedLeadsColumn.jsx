// src/sections/sales/components/lead-distribution/UnassignedLeadsColumnEnhanced.jsx
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
  Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

// Импортируем улучшенную карточку лида
import LeadCard from './LeadCard';

// Заглушки для иконок
const Icons = {
  Warning: '⚠️',
  Sort: '↕️',
  Filter: '🔍',
  Add: '➕',
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
 * Улучшенная колонка для нераспределенных лидов
 */
export default function UnassignedLeadsColumn({ leads, onActionLead, onAddLead }) {
  const theme = useTheme();
  
  // Фильтр лидов по приоритету (опционально)
  const highPriorityLeads = leads.filter(lead => lead.priority === 'Высокий');
  const normalPriorityLeads = leads.filter(lead => lead.priority !== 'Высокий');
  
  // Сортировка лидов по дедлайну (ближайшие сверху)
  const sortedLeads = [...leads].sort((a, b) => {
    const dateA = new Date(a.contact_deadline.split('.').reverse().join('-'));
    const dateB = new Date(b.contact_deadline.split('.').reverse().join('-'));
    return dateA - dateB;
  });
  
  return (
    <Card 
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{ 
        borderRadius: 2,
        boxShadow: theme.shadows[1],
        bgcolor: alpha(theme.palette.warning.main, 0.05),
        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                color: theme.palette.warning.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1,
                fontSize: '1.25rem'
              }}
            >
              {Icons.Warning}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                Нераспределенные лиды
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <Badge
                  badgeContent={leads.length}
                  color="warning"
                  max={99}
                  showZero
                >
                  <Typography variant="caption" color="text.secondary">
                    Всего
                  </Typography>
                </Badge>
                
                {highPriorityLeads.length > 0 && (
                  <Chip 
                    label={`${highPriorityLeads.length} срочных`} 
                    color="error"
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Stack>
            </Box>
          </Box>
        }
        action={
          <Button
            size="small"
            startIcon={Icons.Add}
            variant="outlined"
            color="primary"
            onClick={onAddLead}
          >
            Добавить
          </Button>
        }
        sx={{
          p: 2,
          pb: 1,
          '& .MuiCardHeader-action': { m: 0 }
        }}
      />
      
      <Divider />
      
      <CardContent 
        sx={{ 
          flexGrow: 1,
          p: 2,
          overflowY: 'auto',
          bgcolor: alpha(theme.palette.background.default, 0.5),
          minHeight: 300,
          maxHeight: 500
        }}
      >
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
                {highPriorityLeads.length > 0 && (
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
                        onAction={onActionLead}
                      />
                    ))}
                  </Box>
                )}
                
                {/* Остальные лиды */}
                {normalPriorityLeads.length > 0 && (
                  <Box>
                    {normalPriorityLeads.map((lead, index) => (
                      <LeadCard
                        key={lead.id} 
                        lead={lead} 
                        index={highPriorityLeads.length + index} 
                        isDragging={snapshot.isDraggingOver}
                        onAction={onActionLead}
                      />
                    ))}
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
                </Box>
              )}
            </Box>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );
}

UnassignedLeadsColumn.propTypes = {
  leads: PropTypes.array.isRequired,
  onActionLead: PropTypes.func,
  onAddLead: PropTypes.func
};