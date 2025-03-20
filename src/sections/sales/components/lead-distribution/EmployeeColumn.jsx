// src/sections/sales/components/lead-distribution/EmployeeColumn.jsx
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
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Импортируем компонент карточки лида
import LeadCard from './LeadCard';

// Заглушки для иконок
const Icons = {
  Person: '👤',
  Info: 'ℹ️',
};

// Компонент для отображения колонки сотрудника
const EmployeeColumn = ({ employee, leads, isDropDisabled }) => {
  const theme = useTheme();
  
  // Расчет нагрузки
  const calculatedLoad = leads.length;
  const maxLoad = employee.capacity || 10;
  const loadPercentage = (calculatedLoad / maxLoad) * 100;
  
  // Определение цвета для нагрузки
  const getLoadColor = (percentage) => {
    if (percentage >= 90) return theme.palette.error.main;
    if (percentage >= 70) return theme.palette.warning.main;
    return theme.palette.success.main;
  };
  
  const loadColor = getLoadColor(loadPercentage);
  
  return (
    <Droppable 
      droppableId={`employee-${employee.id}`} 
      isDropDisabled={isDropDisabled}
    >
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.droppableProps}
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
                    width: 32, 
                    height: 32, 
                    mr: 1,
                    bgcolor: employee.color || theme.palette.primary.main
                  }}
                >
                  {employee.name.charAt(0)}
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                  {employee.name}
                </Typography>
              </Box>
            }
            subheader={
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <Box component="span" sx={{ mr: 0.5 }}>
                    {Icons.Person}
                  </Box>
                  {employee.role}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    ml: 1.5, 
                    display: 'flex', 
                    alignItems: 'center',
                    color: loadColor
                  }}
                >
                  <Box component="span" sx={{ mr: 0.5 }}>
                    {Icons.Info}
                  </Box>
                  Нагрузка: {calculatedLoad}/{maxLoad}
                </Typography>
              </Box>
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
            {leads.map((lead, index) => (
              <LeadCard 
                key={lead.id} 
                lead={lead} 
                index={index} 
                isDragging={snapshot.isDraggingOver} 
              />
            ))}
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
          </CardContent>
        </Card>
      )}
    </Droppable>
  );
};

EmployeeColumn.propTypes = {
  employee: PropTypes.object.isRequired,
  leads: PropTypes.array.isRequired,
  isDropDisabled: PropTypes.bool
};

export default EmployeeColumn;