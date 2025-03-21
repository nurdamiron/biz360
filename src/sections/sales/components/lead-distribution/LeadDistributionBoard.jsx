// src/sections/sales/components/lead-distribution/LeadDistributionBoard.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-beautiful-dnd';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Typography,
  CardHeader,
  Chip,
  CircularProgress,
  useMediaQuery,
  Snackbar,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Импортируем сервис для работы с лидами
import { 
  leadDistributionService, 
  assignLead, 
  autoAssignLeads 
} from './leadDistributionService';

// Импортируем подкомпоненты
import UnassignedLeadsColumn from './UnassignedLeadsColumn';
import EmployeeColumn from './EmployeeColumn';
import DistributionStats from './DistributionStats';
import FilterDialog from './FilterDialog';
import AutoAssignSettingsDialog from './AutoAssignSettingsDialog';
import AddLeadDialog from './AddLeadDialog';

// Заглушки для иконок
const Icons = {
  Add: '➕',
  Filter: '🔍',
  AutoAssign: '🔄',
  Refresh: '🔄',
};

// Анимации для framer-motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

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

/**
 * Основной компонент доски распределения лидов
 */
export default function LeadDistributionBoard({ onRefreshData }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Состояние данных
  const [employees, setEmployees] = useState([]);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Состояние UI
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Состояние диалогов
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [autoAssignSettingsOpen, setAutoAssignSettingsOpen] = useState(false);
  const [addLeadDialogOpen, setAddLeadDialogOpen] = useState(false);
  
  // Состояние фильтров и настроек
  const [filters, setFilters] = useState({
    priority: 'all',
    minAmount: '',
    maxAmount: '',
    source: 'all'
  });
  
  const [autoAssignSettings, setAutoAssignSettings] = useState({
    priorityFirst: true,
    balanceLoad: true,
    considerExperience: true,
    maxLeadsPerEmployee: ''
  });
  
  // Загрузка данных
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Загрузка сотрудников и лидов
      const employeeData = await leadDistributionService.fetchEmployees(true);
      const leadData = await leadDistributionService.fetchLeads(true);
      
      // Загрузка статистики
      const statsData = await leadDistributionService.getDistributionStats();
      
      setEmployees(employeeData);
      setLeads(leadData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching data:', error);
      setError('Ошибка при загрузке данных: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Применение фильтров
  const filteredLeads = useMemo(() => leads.filter(lead => {
    // Фильтр по приоритету
    if (filters.priority !== 'all' && lead.priority !== filters.priority) {
      return false;
    }
    
    // Фильтр по источнику
    if (filters.source !== 'all' && lead.source !== filters.source) {
      return false;
    }
    
    // Фильтр по минимальной сумме сделки
    if (filters.minAmount && lead.potential_amount < Number(filters.minAmount)) {
      return false;
    }
    
    // Фильтр по максимальной сумме сделки
    if (filters.maxAmount && lead.potential_amount > Number(filters.maxAmount)) {
      return false;
    }
    
    return true;
  }), [leads, filters]);
  
  // Получение лидов для конкретного сотрудника
  const getEmployeeLeads = useCallback((employeeId) => 
    filteredLeads.filter(lead => lead.assigned_to === employeeId),
  [filteredLeads]);
  
  // Получение нераспределенных лидов
  const unassignedLeads = useMemo(() => 
    filteredLeads.filter(lead => !lead.assigned_to),
  [filteredLeads]);
  
  // Обработчик перетаскивания
  const handleDragEnd = useCallback(async (result) => {
    const { source, destination, draggableId } = result;
    
    // Если нет целевого элемента или перетаскивание в тот же список и позицию
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }
    
    // Получаем ID лида из draggableId (формат "lead-123")
    const leadId = parseInt(draggableId.split('-')[1], 10);
    
    // Получаем ID сотрудника из destination.droppableId (формат "employee-123")
    const employeeId = destination.droppableId === 'unassigned' 
      ? null 
      : parseInt(destination.droppableId.split('-')[1], 10);
    
    try {
      // Вызываем API для обновления данных на сервере
      const updatedLead = await assignLead(leadId, employeeId);
      
      // Обновляем локальное состояние
      setLeads(prevLeads => 
        prevLeads.map(lead => lead.id === leadId ? updatedLead : lead)
      );
      
      // Обновляем статистику
      const statsData = await leadDistributionService.getDistributionStats();
      setStats(statsData);
      
      // Показываем сообщение об успехе
      const leadName = leads.find(lead => lead.id === leadId)?.name || `Лид #${leadId}`;
      const employeeName = employeeId 
        ? employees.find(emp => emp.id === employeeId)?.name || `Сотрудник #${employeeId}`
        : 'нераспределенные';
      
      setSuccessMessage(`${leadName} перемещен к ${employeeName}`);
    } catch (err) {
      console.error('Error assigning lead:', error);
      setError('Ошибка при назначении лида: ' + error.message);
    }
  }, [leads, employees]);
  
  // Обработчик автоматического распределения
  const handleAutoAssign = useCallback(async (settings) => {
    try {
      setIsAutoAssigning(true);
      setError(null);
      
      // Вызываем API для автоматического распределения
      const updatedLeads = await autoAssignLeads(settings);
      
      // Обновляем локальное состояние
      setLeads(updatedLeads);
      
      // Обновляем статистику
      const statsData = await leadDistributionService.getDistributionStats();
      setStats(statsData);
      
      // Показываем сообщение об успехе
      setSuccessMessage('Лиды автоматически распределены');
      
      // Закрываем диалог настроек
      setAutoAssignSettingsOpen(false);
    } catch (err) {
      console.error('Error auto-assigning leads:', error);
      setError('Ошибка при автоматическом распределении: ' + error.message);
    } finally {
      setIsAutoAssigning(false);
    }
  }, []);
  
  // Обработчик добавления нового лида
  const handleAddLead = useCallback(async (leadData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Вызываем API для добавления нового лида
      const newLead = await leadDistributionService.addLead(leadData);
      
      // Обновляем локальное состояние
      setLeads(prevLeads => [...prevLeads, newLead]);
      
      // Обновляем статистику
      const statsData = await leadDistributionService.getDistributionStats();
      setStats(statsData);
      
      // Показываем сообщение об успехе
      setSuccessMessage(`Новый лид "${newLead.name}" добавлен`);
    } catch (err) {
      console.error('Error adding lead:', error);
      setError('Ошибка при добавлении лида: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Обработчик обновления данных
  const handleRefreshData = useCallback(async () => {
    await fetchData();
    
    if (onRefreshData) {
      onRefreshData();
    }
    
    setSuccessMessage('Данные обновлены');
  }, [fetchData, onRefreshData]);
  
  // Обработчик применения фильтров
  const handleApplyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);
  
  // Обработчик применения настроек автораспределения
  const handleApplyAutoAssignSettings = useCallback((newSettings) => {
    setAutoAssignSettings(newSettings);
  }, []);
  
  // Компонент для отображения состояния загрузки
  const renderLoadingState = () => (
    <Box sx={{ width: '100%', py: 4, display: 'flex', justifyContent: 'center' }}>
      <Stack spacing={2} alignItems="center">
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Загрузка данных...
        </Typography>
      </Stack>
    </Box>
  );
  
  return (
    <Box sx={{ width: '100%' }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Статистика распределения */}
        <DistributionStats stats={stats} isLoading={isLoading} />
        
        {/* Основная карточка с доской */}
        <Card
          component={motion.div}
          variants={itemVariants}
          sx={{ 
            borderRadius: 2,
            boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
            mb: 3,
            overflow: 'hidden'
          }}
        >
          <CardHeader 
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" component="span">
                  Распределение лидов
                </Typography>
                <Chip
                  label={`${unassignedLeads.length} нераспределенных`}
                  color={unassignedLeads.length > 0 ? 'warning' : 'success'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
            }
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={Icons.Filter}
                  size="small"
                  onClick={() => setFiltersOpen(true)}
                >
                  Фильтры
                </Button>
                <Button
                  variant="outlined"
                  startIcon={Icons.Add}
                  size="small"
                  onClick={() => setAddLeadDialogOpen(true)}
                >
                  Новый лид
                </Button>
                <Button
                  variant="outlined"
                  startIcon={Icons.AutoAssign}
                  onClick={() => setAutoAssignSettingsOpen(true)}
                  disabled={isAutoAssigning || unassignedLeads.length === 0}
                  size="small"
                >
                  {isAutoAssigning ? 'Распределение...' : 'Автораспределение'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={Icons.Refresh}
                  onClick={handleRefreshData}
                  disabled={isLoading}
                  size="small"
                >
                  Обновить
                </Button>
              </Stack>
            }
          />
          
          {isLoading ? (
            renderLoadingState()
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Grid container spacing={2} sx={{ p: 2 }}>
                {/* Колонка нераспределенных лидов */}
                <Grid item xs={12} md={4} lg={3}>
                  <UnassignedLeadsColumn leads={unassignedLeads} />
                </Grid>
                
                {/* Колонки сотрудников */}
                {employees.map(employee => (
                  <Grid item xs={12} md={4} lg={3} key={employee.id}>
                    <EmployeeColumn
                      employee={employee}
                      leads={getEmployeeLeads(employee.id)}
                      isDropDisabled={false}
                    />
                  </Grid>
                ))}
                
                {employees.length === 0 && !isLoading && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        Нет активных сотрудников для распределения лидов
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DragDropContext>
          )}
        </Card>
        
        {/* Диалоги */}
        <FilterDialog
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          filters={filters}
          onApplyFilters={handleApplyFilters}
        />
        
        <AutoAssignSettingsDialog
          open={autoAssignSettingsOpen}
          onClose={() => setAutoAssignSettingsOpen(false)}
          settings={autoAssignSettings}
          onApplySettings={handleApplyAutoAssignSettings}
          onAutoAssign={handleAutoAssign}
        />
        
        <AddLeadDialog
          open={addLeadDialogOpen}
          onClose={() => setAddLeadDialogOpen(false)}
          onAddLead={handleAddLead}
        />
        
        {/* Snackbar для сообщений об ошибках и успехе */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
        
        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setSuccessMessage(null)} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>
      </motion.div>
    </Box>
  );
}

LeadDistributionBoard.propTypes = {
  onRefreshData: PropTypes.func
};