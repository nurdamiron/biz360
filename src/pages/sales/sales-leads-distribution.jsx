// src/pages/sales/sales-leads-distribution.jsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Container, 
  Typography, 
  Box, 
  Alert, 
  Snackbar,
  LinearProgress 
} from '@mui/material';
import { paths } from 'src/routes/paths';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// Импорт компонентов и сервисов для работы с лидами
import LeadDistributionBoard from 'src/sections/sales/components/lead-distribution/LeadDistributionBoard';
import { 
  fetchSalesEmployees, 
  fetchUnassignedLeads, 
  assignLeadToEmployee, 
  autoAssignLeadsToEmployees 
} from 'src/sections/sales/components/lead-distribution/leadDistributionService';

/**
 * Страница распределения лидов в отделе продаж
 */
export default function SalesLeadsDistributionPage() {
  const [employees, setEmployees] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchData();
  }, []);
  
  // Функция для загрузки данных
  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Загружаем данные параллельно для оптимизации
      const [employeesData, leadsData] = await Promise.all([
        fetchSalesEmployees(),
        fetchUnassignedLeads()
      ]);
      
      setEmployees(employeesData);
      setLeads(leadsData);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };
  
  // Обработчик назначения лида сотруднику
  const handleLeadAssign = async (leadId, employeeId) => {
    try {
      await assignLeadToEmployee(leadId, employeeId);
      
      // Обновляем локальное состояние
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId ? { ...lead, assigned_to: employeeId } : lead
        )
      );
      
      // Показываем уведомление
      setNotification({
        open: true,
        message: `Лид успешно ${employeeId ? 'назначен' : 'откреплен'}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Ошибка при назначении лида:', err);
      setNotification({
        open: true,
        message: 'Не удалось назначить лид. Пожалуйста, попробуйте еще раз.',
        severity: 'error'
      });
    }
  };
  
  // Обработчик автоматического распределения лидов
  const handleAutoAssign = async () => {
    try {
      setLoading(true);
      
      // Получаем нераспределенные лиды
      const unassignedLeads = leads.filter(lead => !lead.assigned_to);
      
      if (unassignedLeads.length === 0) {
        setNotification({
          open: true,
          message: 'Нет лидов для распределения',
          severity: 'info'
        });
        setLoading(false);
        return;
      }
      
      // Распределяем лиды
      const updatedLeads = await autoAssignLeadsToEmployees(unassignedLeads, employees);
      
      // Обновляем локальное состояние
      setLeads(prevLeads => {
        return prevLeads.map(lead => {
          const updatedLead = updatedLeads.find(l => l.id === lead.id);
          return updatedLead || lead;
        });
      });
      
      // Показываем уведомление
      setNotification({
        open: true,
        message: `Успешно распределено ${unassignedLeads.length} лидов`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Ошибка при автоматическом распределении лидов:', err);
      setNotification({
        open: true,
        message: 'Не удалось распределить лиды автоматически. Пожалуйста, попробуйте еще раз.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Обработчик закрытия уведомления
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  return (
    <>
      <Helmet>
        <title>Распределение лидов | Отдел продаж</title>
      </Helmet>
      
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          heading="Распределение лидов"
          links={[
            { name: 'Главная', href: paths.dashboard.root },
            { name: 'Отдел продаж', href: paths.dashboard.sales?.root || '/dashboard/sales' },
            { name: 'Распределение лидов' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        {/* Отображение ошибки, если есть */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        {/* Индикатор загрузки */}
        {loading && <LinearProgress sx={{ mb: 3 }} />}
        
        {/* Основной компонент распределения лидов */}
        <LeadDistributionBoard
          employees={employees}
          unassignedLeads={leads}
          onLeadAssign={handleLeadAssign}
          onAutoAssign={handleAutoAssign}
        />
        
        {/* Уведомление о результате операции */}
        <Snackbar
          open={notification.open}
          autoHideDuration={5000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}