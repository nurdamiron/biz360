// src/hooks/useSalesPlans.js
import { useState, useEffect, useCallback } from 'react';
import { shouldUseMockData } from 'src/utils/mock-data-utils';
import { fetchSalesPlansMock } from 'src/sections/sales/_mock/lead-history-mock';
import axios from 'axios';

/**
 * Хук для работы с планами продаж сотрудника
 * @param {Object} options - Опции хука
 * @returns {Object} - Данные и методы для работы с планами продаж
 */
export function useSalesPlans(options = {}) {
  const {
    employeeId = null, // ID сотрудника (если null - текущий пользователь)
    fetchOnMount = true, // Загружать ли данные при монтировании
    apiUrl = '/api', // Базовый URL API
    mockDelay = 800, // Задержка для мок-данных
  } = options;
  
  // Состояния для хранения данных
  const [salesPlans, setSalesPlans] = useState({
    daily: null,
    weekly: null,
    monthly: null
  });
  
  // Состояния для управления загрузкой
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Функция для получения ID сотрудника
  const getEmployeeId = useCallback(() => {
    // Если ID передан явно, используем его
    if (employeeId) return employeeId;
    
    // Пытаемся получить ID из хранилища
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      return storedUser?.id || 'me';
    } catch (err) {
      console.error('Ошибка при получении ID сотрудника из хранилища:', err);
      return 'me';
    }
  }, [employeeId]);
  
  // Загрузка данных о планах продаж
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const targetId = getEmployeeId();
      console.log('useSalesPlans: загрузка планов для сотрудника', { targetId });
      
      // Проверяем, нужно ли использовать мок-данные
      if (shouldUseMockData()) {
        console.log('useSalesPlans: используем мок-данные для планов');
        
        // Загрузка мок-данных
        const mockData = await fetchSalesPlansMock(mockDelay);
        setSalesPlans(mockData);
      } else {
        console.log('useSalesPlans: используем реальный API для планов');
        
        // Запрос к API
        const endpoint = `${apiUrl}/sales/plans/${targetId}`;
        console.log('useSalesPlans: запрос к API', { endpoint });
        
        const response = await axios.get(endpoint);
        setSalesPlans(response.data);
      }
    } catch (err) {
      console.error('Ошибка при загрузке планов продаж:', err);
      setError('Не удалось загрузить планы продаж. ' + 
        (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  }, [getEmployeeId, mockDelay, apiUrl]);
  
  // Обновление данных о выполнении плана
  const updatePlanProgress = useCallback(async (planType, progressData) => {
    try {
      console.log('useSalesPlans: обновление прогресса плана', { planType, progressData });
      
      // Проверяем, нужно ли использовать мок-данные
      if (shouldUseMockData()) {
        console.log('useSalesPlans: имитация обновления в мок-данных');
        
        // Обновляем локальное состояние
        setSalesPlans(prevPlans => ({
          ...prevPlans,
          [planType]: { ...prevPlans[planType], ...progressData }
        }));
        
        // Имитация задержки API запроса
        await new Promise(resolve => setTimeout(resolve, mockDelay / 2));
        
        return { success: true };
      } else {
        console.log('useSalesPlans: используем реальный API для обновления');
        
        const targetId = getEmployeeId();
        
        // Формируем URL для API запроса
        const endpoint = `${apiUrl}/sales/plans/${targetId}/${planType}`;
        console.log('useSalesPlans: запрос к API', { endpoint, data: progressData });
        
        // Отправляем запрос на обновление данных
        await axios.patch(endpoint, progressData);
        
        // После успешного обновления загружаем актуальные данные
        await fetchPlans();
        
        return { success: true };
      }
    } catch (err) {
      console.error('Ошибка при обновлении прогресса плана:', err);
      
      setError('Не удалось обновить прогресс плана. ' + 
        (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
      
      return { success: false, error: err.message || 'Неизвестная ошибка' };
    }
  }, [getEmployeeId, fetchPlans, mockDelay, apiUrl]);
  
  // Расчет процента выполнения плана
  const calculatePlanCompletion = useCallback((planType, metricKey) => {
    const plan = salesPlans[planType];
    if (!plan) return 0;
    
    const targetKey = `${metricKey}Target`;
    const actualKey = `${metricKey}Actual`;
    
    if (typeof plan[targetKey] !== 'number' || typeof plan[actualKey] !== 'number') {
      return 0;
    }
    
    if (plan[targetKey] === 0) return 0;
    
    return Math.min(Math.round((plan[actualKey] / plan[targetKey]) * 100), 100);
  }, [salesPlans]);
  
  // Загрузка данных при монтировании
  useEffect(() => {
    if (fetchOnMount) {
      fetchPlans();
    }
  }, [fetchOnMount, fetchPlans]);
  
  // Возвращаем данные и методы
  return {
    // Данные
    salesPlans,
    daily: salesPlans.daily,
    weekly: salesPlans.weekly,
    monthly: salesPlans.monthly,
    
    // Методы
    fetchPlans,
    updatePlanProgress,
    calculatePlanCompletion,
    
    // Состояние
    loading,
    error
  };
}

export default useSalesPlans;