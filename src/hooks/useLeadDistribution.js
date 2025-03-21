// src/hooks/useLeadDistribution.js
import { useState, useEffect, useCallback, useRef } from 'react';
import salesService from '../services/salesService';

/**
 * Хук для работы с распределением лидов
 * @param {Object} hookOptions - Опции хука
 * @returns {Object} - Данные и методы для работы с распределением лидов
 */
export function useLeadDistribution(hookOptions = {}) {
  const {
    fetchOnMount = true,
    autoRefreshInterval = null // Интервал автоматического обновления в мс (null - без автообновления)
  } = hookOptions;
  
  // Состояния для хранения данных
  const [employees, setEmployees] = useState([]);
  const [leads, setLeads] = useState([]);
  const [statsData, setStatsData] = useState(null);
  
  // Состояния для управления загрузкой и обновлением
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Ref для отслеживания монтирования компонента
  const isMounted = useRef(true);
  
  // Ref для хранения интервала автообновления
  const autoRefreshIntervalRef = useRef(null);
  
  /**
   * Функция для загрузки данных доски распределения
   */
  const fetchBoardData = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Загружаем данные
      const data = await salesService.getLeadDistributionBoardData();
      
      if (isMounted.current) {
        // Обновляем состояние
        setEmployees(data.employees || []);
        setLeads(data.leads || []);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных доски распределения:', err);
      
      if (isMounted.current) {
        setError(err.message || 'Не удалось загрузить данные');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);
  
  /**
   * Функция для обновления данных (с индикатором обновления)
   */
  const refreshData = useCallback(async () => {
    if (!isMounted.current || refreshing) return;
    
    try {
      setRefreshing(true);
      
      // Загружаем данные
      const data = await salesService.getLeadDistributionBoardData();
      
      if (isMounted.current) {
        // Обновляем состояние
        setEmployees(data.employees || []);
        setLeads(data.leads || []);
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err) {
      console.error('Ошибка при обновлении данных:', err);
      
      if (isMounted.current) {
        setError(err.message || 'Не удалось обновить данные');
      }
    } finally {
      if (isMounted.current) {
        setRefreshing(false);
      }
    }
  }, [refreshing]);
  
  /**
   * Функция для назначения лида сотруднику
   * @param {number|string} leadId - ID лида
   * @param {number|string|null} employeeId - ID сотрудника (null для отмены назначения)
   * @returns {Promise<boolean>} - Результат операции
   */
  const assignLead = useCallback(async (leadId, employeeId) => {
    if (!isMounted.current) return false;
    
    try {
      // Вызываем метод сервиса
      await salesService.assignLead(leadId, employeeId);
      
      if (isMounted.current) {
        // Обновляем локальное состояние
        setLeads(prevLeads => prevLeads.map(lead => 
          lead.id === leadId ? { ...lead, assigned_to: employeeId } : lead
        ));
      }
      
      return true;
    } catch (err) {
      console.error('Ошибка при назначении лида:', err);
      
      if (isMounted.current) {
        setError(err.message || 'Не удалось назначить лид');
      }
      
      return false;
    }
  }, []);
  
  /**
   * Функция для автоматического распределения лидов
   * @param {Object} distributionOptions - Опции распределения
   * @returns {Promise<boolean>} - Результат операции
   */
  const autoDistributeLeads = useCallback(async (distributionOptions = {}) => {
    if (!isMounted.current) return false;
    
    try {
      setLoading(true);
      
      // Вызываем метод сервиса
      const result = await salesService.autoDistributeLeads(distributionOptions);
      
      // После автоматического распределения обновляем данные
      await fetchBoardData();
      
      return true;
    } catch (err) {
      console.error('Ошибка при автоматическом распределении лидов:', err);
      
      if (isMounted.current) {
        setError(err.message || 'Не удалось автоматически распределить лиды');
      }
      
      return false;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [fetchBoardData]);
  
  /**
   * Функция для получения нераспределенных лидов
   * @returns {Array} - Массив нераспределенных лидов
   */
  const getUnassignedLeads = useCallback(() => 
    leads.filter(lead => !lead.assigned_to), [leads]);
  
  /**
   * Функция для получения лидов, назначенных конкретному сотруднику
   * @param {number|string} employeeId - ID сотрудника
   * @returns {Array} - Массив лидов
   */
  const getEmployeeLeads = useCallback((employeeId) => 
    leads.filter(lead => lead.assigned_to === employeeId), [leads]);
  
  /**
   * Функция для получения статистики по загрузке сотрудников
   * @returns {Array} - Статистика
   */
  const getEmployeeLoadStats = useCallback(() => {
    // Подсчитываем количество лидов для каждого сотрудника
    const loadStats = employees.map(employee => {
      const assignedLeads = getEmployeeLeads(employee.id);
      const load = assignedLeads.length;
      const capacity = employee.capacity || 10;
      const loadPercentage = (load / capacity) * 100;
      
      return {
        employeeId: employee.id,
        employeeName: employee.name,
        load,
        capacity,
        loadPercentage,
        isOverloaded: loadPercentage > 100
      };
    });
    
    return loadStats;
  }, [employees, getEmployeeLeads]);
  
  // Загрузка данных при монтировании
  useEffect(() => {
    if (fetchOnMount) {
      fetchBoardData();
    }
    
    return () => {
      isMounted.current = false;
      
      // Очищаем интервал автообновления при размонтировании
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [fetchOnMount, fetchBoardData]);
  
  // Настройка интервала автообновления при изменении пропса
  useEffect(() => {
    // Очищаем предыдущий интервал, если он есть
    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current);
      autoRefreshIntervalRef.current = null;
    }
    
    // Устанавливаем новый интервал, если указан
    if (autoRefreshInterval && autoRefreshInterval > 0) {
      autoRefreshIntervalRef.current = setInterval(() => {
        refreshData();
      }, autoRefreshInterval);
    }
    
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [autoRefreshInterval, refreshData]);
  
  return {
    // Данные
    employees,
    leads,
    stats: statsData,
    lastUpdated,
    
    // Состояние
    loading,
    refreshing,
    error,
    
    // Методы для работы с данными
    fetchBoardData,
    refreshData,
    assignLead,
    autoDistributeLeads,
    
    // Методы для получения данных
    getUnassignedLeads,
    getEmployeeLeads,
    getEmployeeLoadStats
  };
}

export default useLeadDistribution;