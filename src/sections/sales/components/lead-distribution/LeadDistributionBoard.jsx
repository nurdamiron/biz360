// src/sections/sales/components/lead-distribution/SmartLeadDistributionBoard.jsx
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
  Alert,
  Tooltip,
  IconButton,
  Badge,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

// Импортируем иконки (заменить на подходящую библиотеку, например Material Icons)
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import RefreshIcon from '@mui/icons-material/Refresh';
import CategoryIcon from '@mui/icons-material/Category';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';

// Импортируем сервисы и подкомпоненты
import { 
  leadDistributionService, 
  assignLead,
} from './leadDistributionService';

import {
  initializeSmartDistribution,
  smartAssignLeads,
  getExtendedEmployeeStats
} from './leadDistributionService';

// Импортируем улучшенные подкомпоненты
import UnassignedLeadsColumn from './UnassignedLeadsColumn';
import EmployeeColumn from './EmployeeColumn';
import DistributionStats from './DistributionStats';
import FilterDialog from './FilterDialog';
import AssignSettingsDialog from './AssignSettingsDialog';
import AddLeadDialog from './AddLeadDialog';
import EmployeePerformanceModal from './EmployeePerformanceModal';

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
 * Улучшенный компонент доски распределения лидов с интеллектуальным распределением
 */
export default function LeadDistributionBoard({ onRefreshData }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Состояние данных
  const [employees, setEmployees] = useState([]);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [extendedStats, setExtendedStats] = useState(null);
  
  // Состояние UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSmartAssigning, setIsSmartAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  
  // Состояние диалогов
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [smartAssignSettingsOpen, setSmartAssignSettingsOpen] = useState(false);
  const [addLeadDialogOpen, setAddLeadDialogOpen] = useState(false);
  const [employeePerformanceOpen, setEmployeePerformanceOpen] = useState(false);
  
  // Состояние фильтров и настроек
  const [filters, setFilters] = useState({
    priority: 'all',
    minAmount: '',
    maxAmount: '',
    source: 'all',
    industry: 'all'
  });
  
  // Расширенные настройки для интеллектуального распределения
  const [smartAssignSettings, setSmartAssignSettings] = useState({
    priorityFirst: true,
    balanceLoad: true,
    considerExperience: true,
    considerSpecialization: true,
    preserveHistory: true,
    considerPerformance: true,
    maxLeadsPerEmployee: ''
  });
  
  // Опции отображения
  const [viewOptions, setViewOptions] = useState({
    showEmployeeMetrics: true,
    showLeadDetails: true,
    showAssignmentScores: true,
    compactView: false
  });
  
  // Загрузка данных
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Инициализируем интеллектуальный сервис распределения
      await initializeSmartDistribution();
      
      // Загрузка сотрудников и лидов
      const employeeData = await leadDistributionService.fetchEmployees(true);
      const leadData = await leadDistributionService.fetchLeads(true);
      
      // Загрузка базовой статистики
      const statsData = await leadDistributionService.getDistributionStats();
      
      // Загрузка расширенной статистики
      const extendedStatsData = await getExtendedEmployeeStats();
      
      setEmployees(employeeData);
      setLeads(leadData);
      setStats(statsData);
      setExtendedStats(extendedStatsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Ошибка при загрузке данных: ' + err.message);
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
    
    // Фильтр по отрасли
    if (filters.industry !== 'all' && lead.industry !== filters.industry) {
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
      // Находим перетаскиваемый лид и сотрудника
      const draggedLead = leads.find(lead => lead.id === leadId);
      const targetEmployee = employees.find(emp => emp.id === employeeId);
      
      // Анимированное сообщение о перетаскивании
      let assignmentMessage = `${draggedLead?.name || `Лид #${leadId}`} `;
      
      if (employeeId) {
        assignmentMessage += `назначен ${targetEmployee?.name || `Сотруднику #${employeeId}`}`;
      } else {
        assignmentMessage += 'перемещен в нераспределенные';
      }
      
      setSuccessMessage(assignmentMessage);
      
      // Вызываем API для обновления данных на сервере
      const updatedLead = await assignLead(leadId, employeeId);
      
      // Обновляем локальное состояние
      setLeads(prevLeads => 
        prevLeads.map(lead => lead.id === leadId ? updatedLead : lead)
      );
      
      // Обновляем статистику
      const statsData = await leadDistributionService.getDistributionStats();
      setStats(statsData);
      
      // Обновляем расширенную статистику
      const extendedStatsData = await getExtendedEmployeeStats();
      setExtendedStats(extendedStatsData);
      
    } catch (err) {
      console.error('Error assigning lead:', err);
      setError('Ошибка при назначении лида: ' + err.message);
    }
  }, [leads, employees]);
  
  // Обработчик интеллектуального распределения
  const handleSmartAssign = useCallback(async (settings) => {
    try {
      setIsSmartAssigning(true);
      setError(null);
      
      // Анимированное сообщение о процессе
      setSuccessMessage('Выполняется интеллектуальное распределение...');
      
      // Вызываем API для интеллектуального распределения
      const updatedLeads = await smartAssignLeads(settings);
      
      // Обновляем локальное состояние
      setLeads(updatedLeads);
      
      // Обновляем статистику
      const statsData = await leadDistributionService.getDistributionStats();
      setStats(statsData);
      
      // Обновляем расширенную статистику
      const extendedStatsData = await getExtendedEmployeeStats();
      setExtendedStats(extendedStatsData);
      
      // Показываем сообщение об успехе
      setSuccessMessage('Лиды интеллектуально распределены');
      
      // Закрываем диалог настроек
      setSmartAssignSettingsOpen(false);
    } catch (err) {
      console.error('Error smart-assigning leads:', err);
      setError('Ошибка при интеллектуальном распределении: ' + err.message);
    } finally {
      setIsSmartAssigning(false);
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
      
      // Обновляем расширенную статистику при необходимости
      if (viewOptions.showAssignmentScores) {
        const extendedStatsData = await getExtendedEmployeeStats();
        setExtendedStats(extendedStatsData);
      }
      
      // Показываем сообщение об успехе
      setSuccessMessage(`Новый лид "${newLead.name}" добавлен`);
      
      // Закрываем диалог
      setAddLeadDialogOpen(false);
    } catch (err) {
      console.error('Error adding lead:', err);
      setError('Ошибка при добавлении лида: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [viewOptions.showAssignmentScores]);
  
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
  
  // Обработчик применения настроек интеллектуального распределения
  const handleApplySmartAssignSettings = useCallback((newSettings) => {
    setSmartAssignSettings(newSettings);
  }, []);
  
  // Обработчик клика по сотруднику для просмотра детальной информации
  const handleViewEmployeeDetails = useCallback((employeeId) => {
    setSelectedEmployeeId(employeeId);
    setEmployeePerformanceOpen(true);
  }, []);
  
  // Получение сотрудника по ID
  const getSelectedEmployee = useCallback(() => {
    employees.find(emp => emp.id === selectedEmployeeId);
  }, [employees, selectedEmployeeId]);
  
  // Получение расширенной статистики сотрудника
  const getSelectedEmployeeStats = useCallback(() => {
    if (!extendedStats || !selectedEmployeeId) return null;
    
    return extendedStats.employeeDetails?.find(
      empStats => empStats.id === selectedEmployeeId
    );
  }, [extendedStats, selectedEmployeeId]);
  
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
        <DistributionStats 
          stats={stats} 
          extendedStats={extendedStats}
          isLoading={isLoading} 
          showExtendedStats={viewOptions.showAssignmentScores}
          onEmployeeClick={handleViewEmployeeDetails}
        />
        
        {/* Основная карточка с доской */}
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
          <CardHeader 
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" component="span">
                  Интеллектуальное распределение лидов
                </Typography>
                <Tooltip title="Автоматически находит лучшее соответствие между лидами и сотрудниками на основе истории взаимодействий, специализации, опыта и текущей нагрузки">
                  <IconButton size="small" sx={{ ml: 0.5 }}>
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
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
                <Tooltip title="Настроить фильтры">
                  <Button
                    variant="outlined"
                    startIcon={<FilterAltIcon />}
                    size="small"
                    onClick={() => setFiltersOpen(true)}
                  >
                    Фильтры
                  </Button>
                </Tooltip>
                
                <Tooltip title="Добавить нового лида">
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    size="small"
                    onClick={() => setAddLeadDialogOpen(true)}
                  >
                    Новый лид
                  </Button>
                </Tooltip>
                
                <Tooltip title="Интеллектуальное распределение с учетом множества факторов">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AutorenewIcon />}
                    onClick={() => setSmartAssignSettingsOpen(true)}
                    disabled={isSmartAssigning || unassignedLeads.length === 0}
                    size="small"
                  >
                    {isSmartAssigning ? 'Распределение...' : 'Умное распределение'}
                  </Button>
                </Tooltip>
                
                <Tooltip title="Обновить данные">
                  <IconButton
                    color="primary"
                    onClick={handleRefreshData}
                    disabled={isLoading}
                    size="small"
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Настройки отображения">
                  <IconButton
                    color="primary"
                    onClick={() => {/* Можно добавить диалог настроек отображения */}}
                    size="small"
                  >
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            }
          />
          
          {isLoading ? (
            renderLoadingState()
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <AnimatePresence>
                <Grid container spacing={2} sx={{ p: 2 }}>
                  {/* Колонка нераспределенных лидов */}
                  <Grid item xs={12} md={4} lg={3}>
                    <UnassignedLeadsColumn 
                      leads={unassignedLeads} 
                      compactView={viewOptions.compactView}
                      showDetails={viewOptions.showLeadDetails}
                      onAddClick={() => setAddLeadDialogOpen(true)}
                    />
                  </Grid>
                  
                  {/* Колонки сотрудников */}
                  {employees.map(employee => (
                    <Grid item xs={12} md={4} lg={3} key={employee.id}>
                      <EmployeeColumn
                        employee={employee}
                        leads={getEmployeeLeads(employee.id)}
                        metrics={extendedStats?.employeeDetails?.find(e => e.id === employee.id)}
                        isDropDisabled={false}
                        compactView={viewOptions.compactView}
                        showMetrics={viewOptions.showEmployeeMetrics}
                        showAssignmentScore={viewOptions.showAssignmentScores}
                        onEmployeeClick={() => handleViewEmployeeDetails(employee.id)}
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
              </AnimatePresence>
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
        
        <AssignSettingsDialog
          open={smartAssignSettingsOpen}
          onClose={() => setSmartAssignSettingsOpen(false)}
          settings={smartAssignSettings}
          onApplySettings={handleApplySmartAssignSettings}
          onSmartAssign={handleSmartAssign}
        />
        
        <AddLeadDialog
          open={addLeadDialogOpen}
          onClose={() => setAddLeadDialogOpen(false)}
          onAddLead={handleAddLead}
        />
        
        <EmployeePerformanceModal
          open={employeePerformanceOpen}
          onClose={() => setEmployeePerformanceOpen(false)}
          employee={getSelectedEmployee()}
          stats={getSelectedEmployeeStats()}
          leads={getEmployeeLeads(selectedEmployeeId)}
        />
        
        {/* Snackbar для сообщений об ошибках и успехе */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setError(null)} severity="error" variant="filled">
            {error}
          </Alert>
        </Snackbar>
        
        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setSuccessMessage(null)} severity="success" variant="filled">
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