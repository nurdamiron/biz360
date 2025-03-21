// src/services/metrics-service.js
import axios from 'axios';
import { API_URL, shouldUseMockData } from 'src/global-config';
import { generateEmployeeFullMetrics } from 'src/utils/mockData';

// Базовый URL API для метрик
const METRICS_API_URL = `${API_URL}/metrics`;

// Сервис для работы с метриками
const metricsService = {
  /**
   * Получение метрик сотрудника
   * @param {string} employeeId - ID сотрудника ('me' для текущего пользователя)
   * @returns {Promise} - Промис с ответом от сервера
   */
  getEmployeeMetrics: async (employeeId) => {
    const id = employeeId === 'me' ? 'current' : employeeId;
    
    // Проверяем, нужно ли использовать мок-данные
    if (shouldUseMockData()) {
      console.log('metricsService: используем мок-данные для метрик сотрудника', { id });
      
      // Имитация задержки API запроса
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Возвращаем мок-данные
      const mockMetricsData = generateEmployeeFullMetrics(id);
      return { data: mockMetricsData };
    }
    
    // Реальный запрос к API
    return axios.get(`${METRICS_API_URL}/employee/${id}`);
  },
  
  /**
   * Получение метрик отдела
   * @param {string} department - Код отдела
   * @param {Object} params - Дополнительные параметры запроса
   * @returns {Promise} - Промис с ответом от сервера
   */
  getDepartmentMetrics: async (department, params = {}) => {
    // Проверяем, нужно ли использовать мок-данные
    if (shouldUseMockData()) {
      console.log('metricsService: используем мок-данные для метрик отдела', { department, params });
      
      // Имитация задержки API запроса
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Возвращаем мок-данные
      return { data: {} };
    }
    
    // Реальный запрос к API
    return axios.get(`${METRICS_API_URL}/department/${department}`, { params });
  },
  
  /**
   * Получение общих бизнес-метрик
   * @param {Object} params - Параметры запроса (период, фильтры и т.д.)
   * @returns {Promise} - Промис с ответом от сервера
   */
  getBusinessMetrics: async (params = {}) => {
    // Проверяем, нужно ли использовать мок-данные
    if (shouldUseMockData()) {
      console.log('metricsService: используем мок-данные для бизнес-метрик', { params });
      
      // Имитация задержки API запроса
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Возвращаем мок-данные
      return { data: {} };
    }
    
    // Реальный запрос к API
    return axios.get(`${METRICS_API_URL}/business`, { params });
  }
};

export default metricsService;