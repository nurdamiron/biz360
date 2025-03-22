import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Typography,
  Tabs,
  Tab,
  Chip,
  CircularProgress
} from '@mui/material';
import { DragDropContext } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';

// Импорт компонентов
import UnassignedLeadsColumn from './UnassignedLeadsColumn';
import EmployeeColumn from './EmployeeColumn';
import DistributionStats from './DistributionStats';
import FilterDialog from './FilterDialog';
import SmartAssignSettingsDialog from './SmartAssignSettingsDialog';
import AddLeadDialog from './AddLeadDialog';
import EmployeePerformanceModal from './EmployeePerformanceModal';

// Импорт сервисов
import { 
  fetchEmployees, 
  fetchLeads, 
  assignLead, 
  smartAssignLeads,
  getEmployeeStats
} from './leadDistributionService';

// Иконки
import AutorenewIcon from '@mui/icons-material/Autorenew';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';

// Основной компонент
function SmartLeadDistributionBoard() {
  // Состояния данных
  const [employees, setEmployees] = useState([]);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Состояния UI
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [smartAssignOpen, setSmartAssignOpen] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [employeeDetailsOpen, setEmployeeDetailsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filters, setFilters] = useState({
    priority: 'all',
    source: 'all',
    minAmount: '',
    maxAmount: ''
  });
  
  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        const employeesData = await fetchEmployees();
        const leadsData = await fetchLeads();
        const statsData = await getEmployeeStats();
        
        setEmployees(employeesData);
        setLeads(leadsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Обработчик перетаскивания
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    
    // Если нет места назначения или место назначения то же, что и источник
    if (!destination || (destination.droppableId === source.droppableId)) {
      return;
    }
    
    // Получаем ID лида и сотрудника
    const leadId = parseInt(draggableId.split('-')[1]);
    const employeeId = destination.droppableId === 'unassigned' 
      ? null 
      : parseInt(destination.droppableId.split('-')[1]);
    
    try {
      // Обновляем назначение лида
      const updatedLead = await assignLead(leadId, employeeId);
      
      // Обновляем состояние
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? updatedLead : lead
      ));
      
      // Обновляем статистику
      const newStats = await getEmployeeStats();
      setStats(newStats);
    } catch (error) {
      console.error('Error assigning lead:', error);
    }
  };
  
  // Обработчик умного распределения
  const handleSmartAssign = async (settings) => {
    setIsLoading(true);
    
    try {
      // Вызываем сервис умного распределения
      const updatedLeads = await smartAssignLeads(settings);
      
      // Обновляем состояние
      setLeads(updatedLeads);
      
      // Обновляем статистику
      const newStats = await getEmployeeStats();
      setStats(newStats);
      
      // Закрываем диалог настроек
      setSmartAssignOpen(false);
    } catch (error) {
      console.error('Error smart assigning leads:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Получение нераспределенных лидов
  const unassignedLeads = leads.filter(lead => !lead.assigned_to);
  
  // Получение лидов для конкретного сотрудника
  const getEmployeeLeads = (employeeId) => 
    leads.filter(lead => lead.assigned_to === employeeId);
  
  // Обработчик клика по сотруднику
  const handleEmployeeClick = (employeeId) => {
    setSelectedEmployee(employees.find(emp => emp.id === employeeId));
    setEmployeeDetailsOpen(true);
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Статистика распределения */}
      <DistributionStats stats={stats} isLoading={isLoading} />
      
      {/* Основной контент */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Card sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          {/* Верхняя панель с действиями */}
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center" 
            sx={{ mb: 2 }}
          >
            <Typography variant="h6">
              Интеллектуальное распределение лидов
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFiltersOpen(true)}
              >
                Фильтры
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setAddLeadOpen(true)}
              >
                Добавить лид
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<AutorenewIcon />}
                onClick={() => setSmartAssignOpen(true)}
                disabled={unassignedLeads.length === 0}
              >
                Умное распределение
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={() => fetchLeads(true)}
              >
                Обновить
              </Button>
            </Stack>
          </Stack>
          
          {/* Контейнер для колонок */}
          <Grid container spacing={2}>
            {/* Колонка нераспределенных лидов */}
            <Grid item xs={12} md={3}>
              <UnassignedLeadsColumn 
                leads={unassignedLeads} 
                onAddClick={() => setAddLeadOpen(true)}
                isLoading={isLoading}
              />
            </Grid>
            
            {/* Колонки сотрудников */}
            {employees.map(employee => (
              <Grid item xs={12} md={3} key={employee.id}>
                <EmployeeColumn 
                  employee={employee}
                  leads={getEmployeeLeads(employee.id)}
                  metrics={stats?.employees?.find(e => e.id === employee.id)}
                  onEmployeeClick={handleEmployeeClick}
                />
              </Grid>
            ))}
          </Grid>
        </Card>
      </DragDropContext>
      
      {/* Диалоги */}
      <FilterDialog 
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
      />
      
      <SmartAssignSettingsDialog
        open={smartAssignOpen}
        onClose={() => setSmartAssignOpen(false)}
        onApply={handleSmartAssign}
      />
      
      <AddLeadDialog
        open={addLeadOpen}
        onClose={() => setAddLeadOpen(false)}
        onAddLead={(leadData) => {
          // Логика добавления лида
        }}
      />
      
      <EmployeePerformanceModal
        open={employeeDetailsOpen}
        employee={selectedEmployee}
        onClose={() => setEmployeeDetailsOpen(false)}
        stats={stats?.employees?.find(e => e.id === selectedEmployee?.id)}
        leads={selectedEmployee ? getEmployeeLeads(selectedEmployee.id) : []}
      />
    </Box>
  );
}

export default SmartLeadDistributionBoard;