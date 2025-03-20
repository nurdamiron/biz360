// src/hooks/use-leads-data.js
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { shouldUseMockData } from '../utils/mock-data-utils';

/**
 * Мок-данные для лидов и взаимодействий с клиентами
 */
const LEADS_MOCK_DATA = {
  leads: [
    { 
      id: 1, 
      name: 'ООО "ТехноСтарт"', 
      contact: 'Андрей Смирнов', 
      phone: '+7 (901) 123-45-67', 
      email: 'a.smirnov@technostart.ru',
      source: 'Сайт',
      created_at: '2023-03-10T14:30:00',
      status: 'Новый',
      notes: 'Интересуется комплексной автоматизацией',
      assigned_to: null,
      potential_amount: 350000
    },
    { 
      id: 2, 
      name: 'ИП Козлов А.В.', 
      contact: 'Александр Козлов', 
      phone: '+7 (902) 987-65-43', 
      email: 'kozlov@example.com',
      source: 'Рекомендация',
      created_at: '2023-03-11T09:15:00',
      status: 'В работе',
      notes: 'Требуется презентация продукта',
      assigned_to: 12345,
      potential_amount: 120000
    },
    { 
      id: 3, 
      name: 'АО "МегаСтрой"', 
      contact: 'Екатерина Иванова', 
      phone: '+7 (903) 456-78-90', 
      email: 'e.ivanova@megastroy.ru',
      source: 'Конференция',
      created_at: '2023-03-09T16:45:00',
      status: 'В работе',
      notes: 'Запрошено коммерческое предложение',
      assigned_to: 12345,
      potential_amount: 670000
    }
  ],
  interactions: [
    {
      id: 1,
      lead_id: 2,
      type: 'Звонок',
      date: '2023-03-12T10:30:00',
      duration: 15, // в минутах
      result: 'Договорились о встрече',
      notes: 'Клиент заинтересован, задавал много вопросов о функционале',
      quality_score: 85,
      ai_feedback: 'Хорошо отработаны возражения, но стоит лучше презентовать ценность продукта',
      created_by: 12345,
      recording_url: 'https://example.com/recordings/call-12345'
    },
    {
      id: 2,
      lead_id: 3,
      type: 'Встреча',
      date: '2023-03-13T14:00:00',
      duration: 60, // в минутах
      result: 'Презентация проведена, клиент запросил КП',
      notes: 'Клиента интересует интеграция с 1С и обучение сотрудников',
      quality_score: 92,
      ai_feedback: 'Отличная презентация, грамотно выявлены потребности',
      created_by: 12345,
      meeting_protocol: 'Обсуждались модули: аналитика, управление клиентами, документооборот'
    }
  ],
  metrics: {
    total_leads: 35,
    new_leads: 12,
    processed_leads: 23,
    conversion_rates: {
      call_to_meeting: 42,
      meeting_to_proposal: 68,
      proposal_to_deal: 31
    },
    avg_response_time: 3.5, // в часах
    avg_qualification_time: 2.1, // в днях
    avg_deal_cycle: 18.5 // в днях
  }
};

/**
 * Хук для работы с данными лидов и взаимодействий
 * @param {Object} options - Настройки хука
 * @returns {Object} - Данные и функции для работы с лидами
 */
export function useLeadsData(options = {}) {
  const {
    employeeId = null, // ID сотрудника (если null - текущий пользователь)
    fetchOnMount = true, // Загружать ли данные при монтировании
    apiUrl = '/api', // Базовый URL API
    mockDelay = 800, // Задержка мок-данных
  } = options;
  
  const [leadsData, setLeadsData] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(fetchOnMount);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  
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
  
  // Функция для загрузки данных лидов
  const fetchLeadsData = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const targetId = getEmployeeId();
      console.log('useLeadsData: загрузка данных лидов для сотрудника', { targetId });
      
      // Проверяем, нужно ли использовать мок-данные
      if (shouldUseMockData()) {
        console.log('useLeadsData: используем мок-данные для лидов');
        
        // Имитация задержки API запроса
        await new Promise(resolve => setTimeout(resolve, mockDelay));
        
        if (isMounted.current) {
          setLeadsData(LEADS_MOCK_DATA.leads);
          setInteractions(LEADS_MOCK_DATA.interactions);
          setMetrics(LEADS_MOCK_DATA.metrics);
          setLoading(false);
        }
      } else {
        console.log('useLeadsData: используем реальный API для лидов');
        
        // Формируем URL для API запроса
        const leadsEndpoint = `${apiUrl}/sales/leads/${targetId}`;
        const interactionsEndpoint = `${apiUrl}/sales/interactions/${targetId}`;
        const metricsEndpoint = `${apiUrl}/sales/leads/metrics/${targetId}`;
        
        console.log('useLeadsData: запросы к API', { 
          leadsEndpoint, 
          interactionsEndpoint,
          metricsEndpoint
        });
        
        // Параллельные запросы для повышения производительности
        const [leadsResponse, interactionsResponse, metricsResponse] = await Promise.all([
          axios.get(leadsEndpoint),
          axios.get(interactionsEndpoint),
          axios.get(metricsEndpoint)
        ]);
        
        if (isMounted.current) {
          setLeadsData(leadsResponse.data);
          setInteractions(interactionsResponse.data);
          setMetrics(metricsResponse.data);
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных лидов:', err);
      
      if (isMounted.current) {
        setError('Не удалось загрузить данные лидов. ' + 
          (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
        setLoading(false);
      }
    }
  }, [getEmployeeId, mockDelay, apiUrl]);
  
  // Функция для создания нового взаимодействия
  const createInteraction = useCallback(async (leadId, interactionData) => {
    if (!isMounted.current) return false;
    
    try {
      setLoading(true);
      
      const targetId = getEmployeeId();
      console.log('useLeadsData: создание нового взаимодействия', { 
        targetId, leadId, interactionData 
      });
      
      // Проверяем, нужно ли использовать мок-данные
      if (shouldUseMockData()) {
        console.log('useLeadsData: имитация создания взаимодействия в мок-данных');
        
        // Создаем новое взаимодействие с уникальным ID
        const newInteraction = {
          id: Date.now(), // Используем временную метку как уникальный ID
          lead_id: leadId,
          created_by: targetId === 'me' ? 12345 : targetId, // Заглушка для ID
          date: new Date().toISOString(),
          ...interactionData
        };
        
        // Обновляем локальное состояние
        setInteractions(prev => [...prev, newInteraction]);
        
        // Имитация задержки API запроса
        await new Promise(resolve => setTimeout(resolve, mockDelay / 2));
        
        if (isMounted.current) {
          setLoading(false);
        }
        
        return { success: true, data: newInteraction };
      } else {
        console.log('useLeadsData: используем реальный API для создания взаимодействия');
        
        // Формируем URL для API запроса
        const endpoint = `${apiUrl}/sales/leads/${leadId}/interactions`;
        console.log('useLeadsData: запрос к API', { endpoint, data: interactionData });
        
        // Отправляем запрос на создание взаимодействия
        const response = await axios.post(endpoint, interactionData);
        
        // Обновляем список взаимодействий
        await fetchLeadsData();
        
        return { success: true, data: response.data };
      }
    } catch (err) {
      console.error('Ошибка при создании взаимодействия:', err);
      
      if (isMounted.current) {
        setError('Не удалось создать взаимодействие. ' + 
          (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
        setLoading(false);
      }
      
      return { success: false, error: err.message || 'Неизвестная ошибка' };
    }
  }, [getEmployeeId, fetchLeadsData, mockDelay, apiUrl]);
  
  // Функция для обновления статуса лида
  const updateLeadStatus = useCallback(async (leadId, status, notes = '') => {
    if (!isMounted.current) return false;
    
    try {
      setLoading(true);
      
      console.log('useLeadsData: обновление статуса лида', { 
        leadId, status, notes 
      });
      
      // Проверяем, нужно ли использовать мок-данные
      if (shouldUseMockData()) {
        console.log('useLeadsData: имитация обновления статуса лида в мок-данных');
        
        // Обновляем локальное состояние
        setLeadsData(prev => prev.map(lead => 
          lead.id === leadId ? { ...lead, status, notes: notes || lead.notes } : lead
        ));
        
        // Имитация задержки API запроса
        await new Promise(resolve => setTimeout(resolve, mockDelay / 2));
        
        if (isMounted.current) {
          setLoading(false);
        }
        
        return { success: true };
      } else {
        console.log('useLeadsData: используем реальный API для обновления статуса лида');
        
        // Формируем URL для API запроса
        const endpoint = `${apiUrl}/sales/leads/${leadId}`;
        console.log('useLeadsData: запрос к API', { endpoint, data: { status, notes } });
        
        // Отправляем запрос на обновление статуса
        await axios.patch(endpoint, { status, notes });
        
        // Обновляем данные
        await fetchLeadsData();
        
        return { success: true };
      }
    } catch (err) {
      console.error('Ошибка при обновлении статуса лида:', err);
      
      if (isMounted.current) {
        setError('Не удалось обновить статус лида. ' + 
          (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
        setLoading(false);
      }
      
      return { success: false, error: err.message || 'Неизвестная ошибка' };
    }
  }, [fetchLeadsData, mockDelay, apiUrl]);
  
  // Очистка при размонтировании
  useEffect(() => () => {
    isMounted.current = false;
  }, []);
  
  // Загрузка данных при монтировании
  useEffect(() => {
    if (fetchOnMount) {
      fetchLeadsData();
    }
  }, [fetchOnMount, fetchLeadsData]);
  
  return {
    // Состояние
    leadsData,
    interactions,
    metrics,
    loading,
    error,
    
    // Действия
    fetchLeadsData,
    createInteraction,
    updateLeadStatus,
    
    // Вспомогательные геттеры
    totalLeads: metrics?.total_leads || 0,
    newLeads: metrics?.new_leads || 0,
    conversionRates: metrics?.conversion_rates || {},
    avgResponseTime: metrics?.avg_response_time || 0
  };
}