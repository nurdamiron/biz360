// src/hooks/useClientHistory.js
import { useState, useEffect, useCallback } from 'react';
import { shouldUseMockData } from 'src/utils/mock-data-utils';
import { 
  fetchClientHistoryMock, 
  fetchCallHistoryMock,
  CLIENT_STATUSES
} from 'src/sections/sales/_mock/lead-history-mock';
import axios from 'axios';

/**
 * Хук для работы с историей клиентов и звонков
 * @param {Object} options - Опции хука
 * @returns {Object} - Данные и методы для работы с историей клиентов
 */
export function useClientHistory(options = {}) {
  const {
    employeeId = null, // ID сотрудника (если null - текущий пользователь)
    fetchOnMount = true, // Загружать ли данные при монтировании
    apiUrl = '/api', // Базовый URL API
    mockDelay = 800, // Задержка для мок-данных
  } = options;
  
  // Состояния для хранения данных
  const [clients, setClients] = useState([]);
  const [calls, setCalls] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Состояния для управления загрузкой
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingCalls, setLoadingCalls] = useState(false);
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
  
  // Загрузка данных о клиентах
  const fetchClients = useCallback(async () => {
    setLoadingClients(true);
    setError(null);
    
    try {
      const targetId = getEmployeeId();
      console.log('useClientHistory: загрузка клиентов для сотрудника', { targetId });
      
      // Проверяем, нужно ли использовать мок-данные
      if (shouldUseMockData()) {
        console.log('useClientHistory: используем мок-данные для клиентов');
        
        // Загрузка мок-данных
        const mockData = await fetchClientHistoryMock(mockDelay);
        setClients(mockData);
      } else {
        console.log('useClientHistory: используем реальный API для клиентов');
        
        // Запрос к API
        const endpoint = `${apiUrl}/sales/clients/history/${targetId}`;
        console.log('useClientHistory: запрос к API', { endpoint });
        
        const response = await axios.get(endpoint);
        setClients(response.data);
      }
    } catch (err) {
      console.error('Ошибка при загрузке истории клиентов:', err);
      setError('Не удалось загрузить историю клиентов. ' + 
        (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
    } finally {
      setLoadingClients(false);
    }
  }, [getEmployeeId, mockDelay, apiUrl]);
  
  // Загрузка данных о звонках
  const fetchCalls = useCallback(async () => {
    setLoadingCalls(true);
    setError(null);
    
    try {
      const targetId = getEmployeeId();
      console.log('useClientHistory: загрузка звонков для сотрудника', { targetId });
      
      // Проверяем, нужно ли использовать мок-данные
      if (shouldUseMockData()) {
        console.log('useClientHistory: используем мок-данные для звонков');
        
        // Загрузка мок-данных
        const mockData = await fetchCallHistoryMock(mockDelay);
        setCalls(mockData);
      } else {
        console.log('useClientHistory: используем реальный API для звонков');
        
        // Запрос к API
        const endpoint = `${apiUrl}/sales/calls/history/${targetId}`;
        console.log('useClientHistory: запрос к API', { endpoint });
        
        const response = await axios.get(endpoint);
        setCalls(response.data);
      }
    } catch (err) {
      console.error('Ошибка при загрузке истории звонков:', err);
      setError('Не удалось загрузить историю звонков. ' + 
        (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
    } finally {
      setLoadingCalls(false);
    }
  }, [getEmployeeId, mockDelay, apiUrl]);
  
  // Получение данных клиента по ID
  const getClientById = useCallback((clientId) => {
    // Проверяем, что clients - массив 
    if (!Array.isArray(clients)) {
      console.warn('Clients is not an array:', clients);
      return null;
    }

    // Безопасный поиск клиента
    return clients.find(client => client.id === clientId) || null;
  }, [clients]);
  
  // Установка выбранного клиента
  const selectClient = useCallback((clientId) => {
    const client = getClientById(clientId);
    setSelectedClient(client);
    return client;
  }, [getClientById]);
  
  // Получение звонков для конкретного клиента
  const getClientCalls = useCallback((clientId) => calls.filter(call => call.clientId === clientId), [calls]);
  
  // Обновление данных клиента
  const updateClient = useCallback(async (clientId, updatedData) => {
    try {
      console.log('useClientHistory: обновление данных клиента', { clientId, updatedData });
      
      // Проверяем, нужно ли использовать мок-данные
      if (shouldUseMockData()) {
        console.log('useClientHistory: имитация обновления в мок-данных');
        
        // Обновляем локальное состояние
        setClients(prevClients => 
          prevClients.map(client => 
            client.id === clientId ? { ...client, ...updatedData } : client
          )
        );
        
        // Если это выбранный клиент, обновляем и его
        if (selectedClient && selectedClient.id === clientId) {
          setSelectedClient(prev => ({ ...prev, ...updatedData }));
        }
        
        // Имитация задержки API запроса
        await new Promise(resolve => setTimeout(resolve, mockDelay / 2));
        
        return { success: true };
      } else {
        console.log('useClientHistory: используем реальный API для обновления');
        
        // Формируем URL для API запроса
        const endpoint = `${apiUrl}/sales/clients/${clientId}`;
        console.log('useClientHistory: запрос к API', { endpoint, data: updatedData });
        
        // Отправляем запрос на обновление данных
        await axios.patch(endpoint, updatedData);
        
        // После успешного обновления загружаем актуальные данные
        await fetchClients();
        
        return { success: true };
      }
    } catch (err) {
      console.error('Ошибка при обновлении данных клиента:', err);
      
      setError('Не удалось обновить данные клиента. ' + 
        (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
      
      return { success: false, error: err.message || 'Неизвестная ошибка' };
    }
  }, [selectedClient, fetchClients, mockDelay, apiUrl]);
  
  // Добавление нового звонка
  const addCall = useCallback(async (callData) => {
    try {
      console.log('useClientHistory: добавление нового звонка', { callData });
      
      // Проверяем, нужно ли использовать мок-данные
      if (shouldUseMockData()) {
        console.log('useClientHistory: имитация добавления звонка в мок-данных');
        
        // Создаем новый звонок с минимальными данными для ИИ-анализа
        const newCall = {
          id: Date.now(), // Используем timestamp как уникальный ID
          date: new Date().toISOString(),
          employeeId: getEmployeeId(),
          aiAnalysis: {
            overallScore: Math.floor(Math.random() * 41) + 60, // Случайное число от 60 до 100
            categories: {
              greeting: Math.floor(Math.random() * 41) + 60,
              needsIdentification: Math.floor(Math.random() * 41) + 60,
              productPresentation: Math.floor(Math.random() * 41) + 60,
              objectionHandling: Math.floor(Math.random() * 41) + 60,
              closing: Math.floor(Math.random() * 41) + 60
            },
            keyPhrases: [
              'Ключевая фраза 1',
              'Ключевая фраза 2'
            ],
            recommendations: [
              'Рекомендация 1',
              'Рекомендация 2'
            ]
          },
          ...callData
        };
        
        // Обновляем локальное состояние
        setCalls(prevCalls => [...prevCalls, newCall]);
        
        // Имитация задержки API запроса
        await new Promise(resolve => setTimeout(resolve, mockDelay / 2));
        
        return { success: true, data: newCall };
      } else {
        console.log('useClientHistory: используем реальный API для добавления звонка');
        
        // Формируем URL для API запроса
        const endpoint = `${apiUrl}/sales/calls`;
        console.log('useClientHistory: запрос к API', { endpoint, data: callData });
        
        // Отправляем запрос на добавление звонка
        const response = await axios.post(endpoint, callData);
        
        // После успешного добавления загружаем актуальные данные
        await fetchCalls();
        
        return { success: true, data: response.data };
      }
    } catch (err) {
      console.error('Ошибка при добавлении звонка:', err);
      
      setError('Не удалось добавить звонок. ' + 
        (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
      
      return { success: false, error: err.message || 'Неизвестная ошибка' };
    }
  }, [getEmployeeId, fetchCalls, mockDelay, apiUrl]);
  
  // Загрузка данных при монтировании
  useEffect(() => {
    if (fetchOnMount) {
      fetchClients();
      fetchCalls();
    }
  }, [fetchOnMount, fetchClients, fetchCalls]);
  
  // Возвращаем данные и методы
  return {
    // Данные
    clients,
    calls,
    selectedClient,
    CLIENT_STATUSES,
    
    // Методы
    fetchClients,
    fetchCalls,
    getClientById,
    selectClient,
    getClientCalls,
    updateClient,
    addCall,
    
    // Состояние
    loading: loadingClients || loadingCalls,
    loadingClients,
    loadingCalls,
    error
  };
}

export default useClientHistory;