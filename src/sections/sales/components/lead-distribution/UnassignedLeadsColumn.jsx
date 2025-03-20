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
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Импортируем компонент карточки лида
import LeadCard from './LeadCard';

// Заглушки для иконок
const Icons = {
  Warning: '⚠️',
};

// Компонент для отображения колонки нераспределенных лидов
export const UnassignedLeadsColumn = ({ leads }) => {
  const theme = useTheme();
  
  return (
    <Card 
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
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              Нераспределенные лиды
            </Typography>
          </Box>
        }
        subheader={
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Требуют назначения менеджеру
          </Typography>
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
              sx={{
                minHeight: 200,
                borderRadius: 1,
                bgcolor: snapshot.isDraggingOver ? alpha(theme.palette.warning.main, 0.1) : 'transparent',
                transition: 'background-color 0.2s ease'
              }}
            >
              {leads
                .filter(lead => !lead.assigned_to)
                .map((lead, index) => (
                  <LeadCard 
                    key={lead.id} 
                    lead={lead} 
                    index={index} 
                    isDragging={snapshot.isDraggingOver}
                  />
                ))}
              {provided.placeholder}
              
              {leads.filter(lead => !lead.assigned_to).length === 0 && (
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
};

UnassignedLeadsColumn.propTypes = {
  leads: PropTypes.array.isRequired
};

export default UnassignedLeadsColumn;