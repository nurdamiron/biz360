// src/hooks/use-sales-data.js
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { shouldUseMockData } from '../utils/mock-data-utils';
import { 
  fetchMockData, 
  fetchAllMockData 
} from '../sections/sales/_mock/sales-mock-data';

/**
 * Хук для работы с данными отдела продаж
 * @param {Object} options - Настройки запроса
 * @returns {Object} - Данные и состояние загрузки
 */
export function useSalesData(options = {}) {
  const { 
    dataType = 'all', // Тип данных: all, activeClients, completedDeals, metrics, etc.
    employeeId = null, // ID сотрудника (если null - текущий пользователь)
    fetchOnMount = true, // Загружать ли данные при монтировании компонента
    mockDelay = 800, // Задержка для мок-данных (для имитации загрузки)
    apiUrl = '/api', // Базовый URL API
  } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(fetchOnMount);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  
  // Функция для получения ID сотрудника
  const getEmployeeId = useCallback(() => {
    // Если ID передан явно, используем его
    if (employeeId) return employeeId;
    
    // Пытаемся получить ID из хранилища (localStorage/sessionStorage)
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      return storedUser?.id || 'me';
    } catch (err) {
      console.error('Ошибка при получении ID сотрудника из хранилища:', err);
      return 'me';
    }
  }, [employeeId]);
  
  // Функция для загрузки данных
  const fetchData = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Определяем ID сотрудника
      const targetId = getEmployeeId();
      console.log('useSalesData: загрузка данных для сотрудника', { targetId, dataType });
      
      // Проверяем, нужно ли использовать мок-данные
      if (shouldUseMockData()) {
        console.log('useSalesData: используем мок-данные');
        
        let mockResult;
        
        if (dataType === 'all') {
          // Загрузка всех мок-данных сразу
          mockResult = await fetchAllMockData(mockDelay);
        } else {
          // Загрузка конкретного типа данных
          mockResult = await fetchMockData(dataType, mockDelay);
        }
        
        if (isMounted.current) {
          setData(mockResult);
          setLoading(false);
        }
      } else {
        console.log('useSalesData: используем реальный API');
        
        // Формируем URL для API запроса
        let endpoint;
        
        switch (dataType) {
          case 'all':
            endpoint = `${apiUrl}/sales/dashboard/${targetId}`;
            break;
          case 'activeClients':
            endpoint = `${apiUrl}/sales/clients/active/${targetId}`;
            break;
          case 'completedDeals':
            endpoint = `${apiUrl}/sales/deals/completed/${targetId}`;
            break;
          case 'newAssignments':
            endpoint = `${apiUrl}/sales/assignments/new/${targetId}`;
            break;
          case 'performance':
            endpoint = `${apiUrl}/sales/performance/${targetId}`;
            break;
          case 'metrics':
            endpoint = `${apiUrl}/metrics/employee/${targetId}`;
            break;
          default:
            endpoint = `${apiUrl}/sales/${dataType}/${targetId}`;
        }
        
        console.log('useSalesData: запрос к API', { endpoint });
        
        const response = await axios.get(endpoint);
        
        if (isMounted.current) {
          setData(response.data);
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных отдела продаж:', err);
      
      if (isMounted.current) {
        setError('Не удалось загрузить данные. ' + (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
        setLoading(false);
      }
    }
  }, [dataType, getEmployeeId, mockDelay, apiUrl]);
  
  // Очистка при размонтировании
  useEffect(() => 
    // ESLint рекомендует стрелочные функции без блоков
    () => { isMounted.current = false; }
  , []);
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const controller = new AbortController();
    
    if (fetchOnMount) {
      fetchData();
    }
    
    return () => {
      controller.abort(); // Отменяем текущий запрос
      isMounted.current = false;
    };
  }, [fetchOnMount, fetchData]);
  
  // Вспомогательные геттеры для удобного доступа к данным
  const employee = data?.employee || null;
  const metrics = data?.metrics || null;
  const activeClients = data?.activeClients || [];
  const completedDeals = data?.completedDeals || [];
  const newAssignments = data?.newAssignments || [];
  const salesPerformance = data?.salesPerformance || null;
  const improvements = data?.improvements || [];
  const chartData = data?.chartData || [];
  const leadInteractions = data?.leadInteractions || [];
  
  return {
    data,
    loading,
    error,
    refetch: fetchData,
    employee,
    metrics,
    activeClients,
    completedDeals,
    newAssignments,
    salesPerformance,
    improvements,
    chartData,
    leadInteractions
  };
}