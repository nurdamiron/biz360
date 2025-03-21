// src/hooks/useLeadAnalytics.js
import { useState, useEffect, useCallback } from 'react';
import salesService from '../services/salesService';

/**
 * Хук для работы с аналитикой лидов
 * @param {Object} options - Опции хука
 * @returns {Object} - Данные аналитики и методы для работы с ними
 */
export function useLeadAnalytics(options = {}) {
  const {
    fetchOnMount = true,
    period = 'month',
    employeeId = null
  } = options;
  
  // Состояния для хранения данных
  const [conversionData, setConversionData] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [leadsByStatus, setLeadsByStatus] = useState([]);
  const [leadsByTime, setLeadsByTime] = useState([]);
  const [metrics, setMetrics] = useState({});
  
  // Состояния для управления загрузкой
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [currentPeriod, setCurrentPeriod] = useState(period);
  
  /**
   * Загрузка данных по воронке конверсии
   */
  const fetchConversionData = useCallback(async () => {
    try {
      const data = await salesService.getConversionFunnelData();
      setConversionData(data);
      
      // Очищаем ошибку, если она была
      setErrors(prev => ({ ...prev, conversionData: null }));
    } catch (error) {
      console.error('Ошибка при загрузке данных воронки конверсии:', error);
      setErrors(prev => ({ ...prev, conversionData: error.message }));
    }
  }, []);
  
  /**
   * Загрузка данных по источникам лидов
   */
  const fetchLeadSources = useCallback(async () => {
    try {
      const data = await salesService.getLeadSourcesAnalytics();
      setLeadSources(data);
      
      // Очищаем ошибку, если она была
      setErrors(prev => ({ ...prev, leadSources: null }));
    } catch (error) {
      console.error('Ошибка при загрузке данных по источникам лидов:', error);
      setErrors(prev => ({ ...prev, leadSources: error.message }));
    }
  }, []);
  
  /**
   * Загрузка данных по статусам лидов
   */
  const fetchLeadsByStatus = useCallback(async () => {
    try {
      const data = await salesService.getLeadsByStatusData();
      setLeadsByStatus(data);
      
      // Очищаем ошибку, если она была
      setErrors(prev => ({ ...prev, leadsByStatus: null }));
    } catch (error) {
      console.error('Ошибка при загрузке данных по статусам лидов:', error);
      setErrors(prev => ({ ...prev, leadsByStatus: error.message }));
    }
  }, []);
  
  /**
   * Загрузка данных по времени
   */
  const fetchLeadsByTime = useCallback(async (periodToFetch = currentPeriod) => {
    try {
      const data = await salesService.getLeadTimeData(periodToFetch);
      setLeadsByTime(data);
      
      // Очищаем ошибку, если она была
      setErrors(prev => ({ ...prev, leadsByTime: null }));
    } catch (error) {
      console.error('Ошибка при загрузке данных по времени:', error);
      setErrors(prev => ({ ...prev, leadsByTime: error.message }));
    }
  }, [currentPeriod]);
  
  /**
   * Загрузка метрик лидов
   */
  const fetchMetrics = useCallback(async () => {
    try {
      const data = await salesService.getLeadMetrics();
      setMetrics(data);
      
      // Очищаем ошибку, если она была
      setErrors(prev => ({ ...prev, metrics: null }));
    } catch (error) {
      console.error('Ошибка при загрузке метрик лидов:', error);
      setErrors(prev => ({ ...prev, metrics: error.message }));
    }
  }, []);
  
  /**
   * Обновление всех данных
   */
  const refreshAllData = useCallback(async () => {
    setLoading(true);
    
    try {
      await Promise.all([
        fetchConversionData(),
        fetchLeadSources(),
        fetchLeadsByStatus(),
        fetchLeadsByTime(currentPeriod),
        fetchMetrics()
      ]);
    } catch (error) {
      console.error('Ошибка при обновлении данных:', error);
    } finally {
      setLoading(false);
    }
  }, [
    fetchConversionData,
    fetchLeadSources,
    fetchLeadsByStatus,
    fetchLeadsByTime,
    fetchMetrics,
    currentPeriod
  ]);
  
  /**
   * Обработчик изменения периода
   */
  const handlePeriodChange = useCallback(async (newPeriod) => {
    setCurrentPeriod(newPeriod);
    
    setLoading(true);
    try {
      await fetchLeadsByTime(newPeriod);
    } catch (error) {
      console.error('Ошибка при изменении периода:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchLeadsByTime]);
  
  /**
   * Загрузка данных при монтировании и изменении зависимостей
   */
  useEffect(() => {
    if (fetchOnMount) {
      refreshAllData();
    }
  }, [fetchOnMount, refreshAllData]);
  
  /**
   * Обработчик скачивания отчета
   */
  const handleDownloadReport = useCallback((reportPeriod = currentPeriod) => {
    console.log(`Запрос на скачивание отчета за период ${reportPeriod}`);
    
    // Здесь будет логика для скачивания отчета
    alert(`Отчет за период ${reportPeriod} будет скачан. Эта функция находится в разработке.`);
    
    // В реальном приложении здесь будет запрос к API для генерации и скачивания отчета
  }, [currentPeriod]);
  
  return {
    // Данные
    conversionData,
    leadSources,
    leadsByStatus,
    leadsByTime,
    metrics,
    
    // Состояние загрузки
    loading,
    errors,
    currentPeriod,
    
    // Методы
    refreshAllData,
    handlePeriodChange,
    handleDownloadReport,
    
    // Отдельные методы для обновления конкретных данных
    fetchConversionData,
    fetchLeadSources,
    fetchLeadsByStatus,
    fetchLeadsByTime,
    fetchMetrics
  };
}

export default useLeadAnalytics;