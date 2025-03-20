// src/hooks/use-sales-data.js
import { useState, useEffect, useCallback } from 'react';
import axiosInstance from 'src/lib/axios';
import { 
  shouldUseMockData, 
  fetchMockData 
} from 'src/sections/sales/_mock/sales-mock-data';
import { useAuth } from 'src/auth/hooks/use-auth';

/**
 * Хук для работы с данными отдела продаж
 * @param {Object} options - Настройки запроса
 * @returns {Object} - Данные и состояние загрузки
 */
export function useSalesData(options = {}) {
  const { 
    dataType = 'all', // Тип данных: all, activeClients, completedDeals, performance, etc.
    employeeId = null, // ID сотрудника, если null - текущий пользователь
    fetchOnMount = true, // Загружать ли данные при монтировании компонента
    mockDelay = 800 // Задержка для мок-данных (для имитации загрузки)
  } = options;
  
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(fetchOnMount);
  const [error, setError] = useState(null);
  
  // Функция для загрузки данных
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Определяем ID сотрудника
      const targetId = employeeId || (user?.id || 'me');
      
      // Проверяем, нужно ли использовать мок-данные
      if (shouldUseMockData()) {
        // Загружаем мок-данные в зависимости от типа данных
        let mockResult;
        
        if (dataType === 'all') {
          // Загрузка всех типов данных для дашборда
          const employee = await fetchMockData('employee', mockDelay);
          const metrics = await fetchMockData('metrics', mockDelay);
          const activeClients = await fetchMockData('activeClients', mockDelay);
          const completedDeals = await fetchMockData('completedDeals', mockDelay);
          const salesPerformance = await fetchMockData('salesPerformance', mockDelay);
          const improvements = await fetchMockData('improvements', mockDelay);
          const chartData = await fetchMockData('chartData', mockDelay);
          
          mockResult = {
            employee,
            metrics,
            activeClients,
            completedDeals,
            salesPerformance,
            improvements,
            chartData
          };
        } else {
          // Загрузка конкретного типа данных
          mockResult = await fetchMockData(dataType, mockDelay);
        }
        
        setData(mockResult);
      } else {
        // Используем реальное API
        let endpoint;
        
        switch (dataType) {
          case 'all':
            // Запрос всех данных для дашборда
            endpoint = `/api/sales/dashboard/${targetId}`;
            break;
          case 'activeClients':
            endpoint = `/api/sales/clients/active/${targetId}`;
            break;
          case 'completedDeals':
            endpoint = `/api/sales/deals/completed/${targetId}`;
            break;
          case 'newAssignments':
            endpoint = `/api/sales/assignments/new/${targetId}`;
            break;
          case 'performance':
            endpoint = `/api/sales/performance/${targetId}`;
            break;
          case 'metrics':
            endpoint = `/api/metrics/employee/${targetId}`;
            break;
          default:
            endpoint = `/api/sales/${dataType}/${targetId}`;
        }
        
        const response = await axiosInstance.get(endpoint);
        setData(response.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при загрузке данных отдела продаж:', err);
      setError('Не удалось загрузить данные. ' + (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
      setLoading(false);
    }
  }, [dataType, employeeId, user, mockDelay]);
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    if (fetchOnMount && isAuthenticated) {
      fetchData();
    }
  }, [fetchOnMount, fetchData, isAuthenticated]);
  
  return {
    data,
    loading,
    error,
    refetch: fetchData,
    // Вспомогательные функции для удобного доступа к данным
    employee: data?.employee || null,
    metrics: data?.metrics || null,
    activeClients: data?.activeClients || [],
    completedDeals: data?.completedDeals || [],
    salesPerformance: data?.salesPerformance || null,
    improvements: data?.improvements || [],
    chartData: data?.chartData || []
  };
}