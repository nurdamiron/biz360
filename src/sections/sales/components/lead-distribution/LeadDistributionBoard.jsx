// src/sections/sales/components/lead-distribution/LeadDistributionBoard.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Box,
  Card,
  Grid,
  Paper,
  Stack,
  Button,
  Divider,
  Typography,
  CardHeader,
  CardContent,
  Chip,
  Avatar,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  alpha,
  Alert,
  CircularProgress,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { fCurrency } from 'src/utils/format-number';

// Заглушки для иконок
const Icons = {
  Add: '➕',
  Filter: '🔍',
  Sort: '↕️',
  Settings: '⚙️',
  AutoAssign: '🔄',
  Star: '⭐',
  Info: 'ℹ️',
  Person: '👤',
  Money: '💰',
  Time: '⏱️',
  Warning: '⚠️',
  Success: '✅',
  Error: '❌',
  EditPencil: '✏️',
  Company: '🏢',
  Phone: '📞',
  Email: '📧',
  Calendar: '📅',
  ArrowDown: '↓',
  ArrowUp: '↑',
  DragHandle: '⋮⋮',
  MoreVert: '⋯',
  Check: '✓',
  Close: '✕',
};

// Компонент для отображения карточки лида
const LeadCard = ({ lead, index, isDragging }) => {
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  
  // Получение цвета для приоритета
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Высокий':
        return theme.palette.error.main;
      case 'Средний':
        return theme.palette.warning.main;
      case 'Низкий':
        return theme.palette.success.main;
      default:
        return theme.palette.info.main;
    }
  };
  
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  return (
    <Draggable draggableId={`lead-${lead.id}`} index={index}>
      {(provided) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            boxShadow: theme.shadows[isDragging ? 8 : 1],
            border: `1px solid ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
            bgcolor: isDragging ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: theme.shadows[3],
              borderColor: alpha(theme.palette.primary.main, 0.3)
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                {...provided.dragHandleProps}
                sx={{ 
                  color: theme.palette.text.secondary,
                  cursor: 'grab',
                  mr: 1,
                  '&:hover': { color: theme.palette.text.primary }
                }}
              >
                {Icons.DragHandle}
              </Box>
              <Typography variant="subtitle2" noWrap sx={{ maxWidth: 180 }}>
                {lead.name}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                label={lead.status}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.75rem',
                  mr: 0.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main
                }}
              />
              <IconButton size="small" onClick={handleMenuOpen}>
                {Icons.MoreVert}
              </IconButton>
            </Box>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Stack spacing={1} sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ color: theme.palette.text.secondary, mr: 0.5 }}>
                  {Icons.Company}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Контакт:
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: 150 }}>
                {lead.contact}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ color: theme.palette.text.secondary, mr: 0.5 }}>
                  {Icons.Money}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Потенц. сумма:
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight="bold" color="success.main">
                {fCurrency(lead.potential_amount)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  component="span" 
                  sx={{ 
                    color: getPriorityColor(lead.priority), 
                    mr: 0.5 
                  }}
                >
                  {Icons.Warning}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Приоритет:
                </Typography>
              </Box>
              <Chip
                label={lead.priority}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  bgcolor: alpha(getPriorityColor(lead.priority), 0.1),
                  color: getPriorityColor(lead.priority)
                }}
              />
            </Box>
          </Stack>
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tooltip title="Срок первого контакта" arrow>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ color: theme.palette.error.main, mr: 0.5 }}>
                  {Icons.Calendar}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  До {lead.contact_deadline || 'Не указано'}
                </Typography>
              </Box>
            </Tooltip>
            
            <Button
              variant="text"
              size="small"
              sx={{ 
                p: 0, 
                minWidth: 'auto', 
                color: theme.palette.primary.main,
                textTransform: 'none'
              }}
            >
              Подробнее
            </Button>
          </Box>
          
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: { width: 200, mt: 1 }
            }}
          >
            <MenuItem onClick={handleMenuClose}>
              <Box component="span" sx={{ mr: 1.5 }}>
                {Icons.Phone}
              </Box>
              Позвонить
            </MenuItem>
            
            <MenuItem onClick={handleMenuClose}>
              <Box component="span" sx={{ mr: 1.5 }}>
                {Icons.Email}
              </Box>
              Отправить email
            </MenuItem>
            
            <MenuItem onClick={handleMenuClose}>
              <Box component="span" sx={{ mr: 1.5 }}>
                {Icons.EditPencil}
              </Box>
              Редактировать
            </MenuItem>
            
            <Divider />
            
            <MenuItem 
              onClick={handleMenuClose}
              sx={{ color: theme.palette.error.main }}
            >
              <Box component="span" sx={{ mr: 1.5 }}>
                {Icons.Close}
              </Box>
              Удалить
            </MenuItem>
          </Menu>
        </Paper>
      )}
    </Draggable>
  );
};

LeadCard.propTypes = {
  lead: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  isDragging: PropTypes.bool
};

// Компонент для отображения карточки сотрудника
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

// Основной компонент доски распределения лидов
export default function LeadDistributionBoard({ 
  employees = [], 
  unassignedLeads = [], 
  onLeadAssign, 
  onAutoAssign
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [localEmployees, setLocalEmployees] = useState(employees);
  const [localUnassignedLeads, setLocalUnassignedLeads] = useState(unassignedLeads);
  const [loading, setLoading] = useState(false);
  
  // Обновление локальных данных при изменении пропсов
  useEffect(() => {
    setLocalEmployees(employees);
    setLocalUnassignedLeads(unassignedLeads);
  }, [employees, unassignedLeads]);
  
  // Получение лидов для конкретного сотрудника
  const getEmployeeLeads = (employeeId) => 
    localUnassignedLeads.filter(lead => lead.assigned_to === employeeId);
  
  // Обработчик перетаскивания
  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    
    // Если нет целевого элемента или перетаскивание в тот же список и позицию
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }
    
    // Получаем ID лида из draggableId (формат "lead-123")
    const leadId = parseInt(draggableId.split('-')[1], 10);
    const lead = localUnassignedLeads.find(l => l.id === leadId);
    
    if (!lead) return;
    
    // Получаем ID сотрудника из destination.droppableId (формат "employee-123")
    const employeeId = destination.droppableId === 'unassigned' 
      ? null 
      : parseInt(destination.droppableId.split('-')[1], 10);
    
    // Создаем копию лидов
    const updatedLeads = localUnassignedLeads.map(l => 
      l.id === leadId ? { ...l, assigned_to: employeeId } : l
    );
    
    // Обновляем локальное состояние
    setLocalUnassignedLeads(updatedLeads);
    
    // Вызываем callback для обновления данных на сервере
    if (onLeadAssign) {
      onLeadAssign(leadId, employeeId);
    }
  };
  
  // Обработчик автоматического распределения
  const handleAutoAssign = async () => {
    setLoading(true);
    
    try {
      if (onAutoAssign) {
        await onAutoAssign();
      } else {
        // Если callback не предоставлен, имитируем автоматическое распределение
        const availableEmployees = localEmployees.filter(emp => 
          getEmployeeLeads(emp.id).length < (emp.capacity || 10)
        );
        
        if (availableEmployees.length === 0) {
          console.warn('Нет доступных сотрудников для автоматического распределения');
          return;
        }
        
        // Простой алгоритм распределения: равномерно между доступными сотрудниками
        const unassigned = localUnassignedLeads.filter(lead => !lead.assigned_to);
        
        const updatedLeads = [...localUnassignedLeads];
        
        unassigned.forEach((lead, index) => {
          const employeeIndex = index % availableEmployees.length;
          const employeeId = availableEmployees[employeeIndex].id;
          
          const leadIndex = updatedLeads.findIndex(l => l.id === lead.id);
          if (leadIndex !== -1) {
            updatedLeads[leadIndex] = { ...updatedLeads[leadIndex], assigned_to: employeeId };
          }
        });
        
        setLocalUnassignedLeads(updatedLeads);
      }
    } catch (error) {
      console.error('Ошибка при автоматическом распределении лидов:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card 
      sx={{ 
        borderRadius: 2,
        boxShadow: theme.shadows[8]
      }}
    >
      <CardHeader 
        title="Распределение лидов" 
        subheader={`${localUnassignedLeads.filter(lead => !lead.assigned_to).length} нераспределенных лидов`}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={Icons.Filter}
              size="small"
            >
              Фильтры
            </Button>
            <Button
              variant="contained"
              startIcon={Icons.AutoAssign}
              onClick={handleAutoAssign}
              disabled={loading}
              size="small"
            >
              {loading ? 'Распределение...' : 'Авто распределение'}
            </Button>
          </Stack>
        }
      />
      
      <Divider />
      
      <CardContent sx={{ p: 2 }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Grid container spacing={2}>
            {/* Колонка нераспределенных лидов */}
            <Grid item xs={12} md={4} lg={3}>
              <Card 
                sx={{ 
                  borderRadius: 2,
                  boxShadow: theme.shadows[1],
                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
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
                        {localUnassignedLeads
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
                        
                        {localUnassignedLeads.filter(lead => !lead.assigned_to).length === 0 && (
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
            </Grid>
            
            {/* Колонки сотрудников */}
            {localEmployees.map(employee => (
              <Grid item xs={12} md={4} lg={3} key={employee.id}>
                <EmployeeColumn
                  employee={employee}
                  leads={localUnassignedLeads.filter(lead => lead.assigned_to === employee.id)}
                  isDropDisabled={false}
                />
              </Grid>
            ))}
          </Grid>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}

LeadDistributionBoard.propTypes = {
  employees: PropTypes.array,
  unassignedLeads: PropTypes.array,
  onLeadAssign: PropTypes.func,
  onAutoAssign: PropTypes.func
};