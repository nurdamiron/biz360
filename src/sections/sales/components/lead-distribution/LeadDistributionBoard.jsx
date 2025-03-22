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
  Alert,
  Tooltip,
  IconButton,
  Badge,
  alpha,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

// Material UI иконки
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Импортируем компоненты
import UnassignedLeadsColumn from './UnassignedLeadsColumn';
import EmployeeColumn from './EmployeeColumn';
import DistributionStats from './DistributionStats';
import FilterDialog from './FilterDialog';
import SmartAssignSettingsDialog from './SmartAssignSettingsDialog';
import AddLeadDialog from './AddLeadDialog';
import EmployeePerformanceModal from './EmployeePerformanceModal';

// Импортируем сервисы и утилиты
import { 
  leadDistributionService, 
  fetchEmployees, 
  fetchLeads, 
  assignLead,
  addLead,
  getDistributionStats
} from './leadDistributionService';
import {
  initializeSmartDistribution,
  smartAssignLeads,
  getExtendedEmployeeStats
} from './smartLeadDistributionService';

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
  
  // Настройки для интеллектуального распределения
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
  
  // Состояние режима мок-данных
  const [mockMode, setMockMode] = useState(() => {
    localStorage.getItem('useMockData') === 'true';
  });
  
  // Обработчик изменения режима мок-данных
  const handleToggleMockMode = (event) => {
    const newMockMode = event.target.checked;
    setMockMode(newMockMode);
    localStorage.setItem('useMockData', newMockMode ? 'true' : 'false');
    
    // Обновляем данные с новым режимом
    fetchData();
  };
  
  // Обработчик переключения опций отображения
  const handleToggleViewOption = (option) => {
    setViewOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  // Загрузка данных
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Инициализируем интеллектуальный сервис распределения
      await initializeSmartDistribution();
      
      // Загрузка сотрудников и лидов
      const employeeData = await fetchEmployees(true);
      const leadData = await fetchLeads(true);
      
      // Загрузка базовой статистики
      const statsData = await getDistributionStats();
      
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
      const statsData = await getDistributionStats();
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
      const statsData = await getDistributionStats();
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
      const newLead = await addLead(leadData);
      
      // Обновляем локальное состояние
      setLeads(prevLeads => [...prevLeads, newLead]);
      
      // Обновляем статистику
      const statsData = await getDistributionStats();
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
  
  // Обработчик действий с лидом
  const handleLeadAction = useCallback((leadId, action) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    
    switch (action) {
      case 'call':
        setSuccessMessage(`Звонок клиенту ${lead.name}`);
        break;
      case 'email':
        setSuccessMessage(`Отправка email клиенту ${lead.name}`);
        break;
      case 'edit':
        setSuccessMessage(`Редактирование лида ${lead.name}`);
        break;
      case 'delete':
        setSuccessMessage(`Удаление лида ${lead.name}`);
        break;
      default:
        break;
    }
  }, [leads]);
  
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
        {/* Панель настроек режима работы */}
        <Card sx={{ mb: 3, p: 2, borderRadius: 2 }}>
          <Stack 
            direction={isMobile ? 'column' : 'row'} 
            justifyContent="space-between" 
            alignItems={isMobile ? 'stretch' : 'center'}
            spacing={2}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={mockMode}
                  onChange={handleToggleMockMode}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Режим мок-данных
                  </Typography>
                  <Tooltip title="В этом режиме используются тестовые данные вместо обращения к API. Удобно для демонстрации и тестирования.">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              }
            />
            
            <Stack direction="row" spacing={2} alignItems="center">
              <Tooltip title={viewOptions.compactView ? 'Стандартный вид' : 'Компактный вид'}>
                <IconButton 
                  color="primary" 
                  onClick={() => handleToggleViewOption('compactView')}
                >
                  {viewOptions.compactView ? <ViewModuleIcon /> : <ViewCompactIcon />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title={viewOptions.showEmployeeMetrics ? 'Скрыть метрики' : 'Показать метрики'}>
                <IconButton 
                  color="primary"
                  onClick={() => handleToggleViewOption('showEmployeeMetrics')}
                >
                  {viewOptions.showEmployeeMetrics ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title={viewOptions.showAssignmentScores ? 'Скрыть оценки назначения' : 'Показать оценки назначения'}>
                <IconButton 
                  color="primary"
                  onClick={() => handleToggleViewOption('showAssignmentScores')}
                >
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Card>
        
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
                      onActionLead={handleLeadAction}
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
                        onActionLead={handleLeadAction}
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
        
        <SmartAssignSettingsDialog
          open={smartAssignSettingsOpen}
          onClose={() => setSmartAssignSettingsOpen(false)}
          settings={smartAssignSettings}
          onApplySettings={handleApplySmartAssignSettings}
          onSmartAssign={handleSmartAssign}
          isAssigning={isSmartAssigning}
        />
        
        <AddLeadDialog
          open={addLeadDialogOpen}
          onClose={() => setAddLeadDialogOpen(false)}
          onAddLead={handleAddLead}
          isAdding={isLoading}
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