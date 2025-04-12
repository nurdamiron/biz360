// src/services/employee-service.js
import axios from 'axios';
import { API_URL, shouldUseMockData } from 'src/global-config';
import { generateEmployeeFullMetrics } from 'src/utils/mockData';
import { fetchAllMockData } from 'src/sections/sales/_mock/sales-mock-data';

// Базовый URL API для сотрудников
const EMPLOYEE_API_URL = `${API_URL}/employees`;

const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal  
    });
    
    clearTimeout(id);
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Сервис для работы с данными сотрудников
const employeeService = {
  /**
   * Получение данных сотрудника по ID
   * @param {string} id - ID сотрудника ('me' для текущего пользователя)
   * @returns {Promise} - Промис с ответом от сервера
   */
  getEmployeeById: async (id) => {
    const employeeId = id === 'me' ? 'current' : id;
    
    // Проверяем, нужно ли использовать мок-данные
    if (shouldUseMockData()) {
      console.log('employeeService: используем мок-данные для сотрудника', { employeeId });
      
      // Имитация задержки API запроса
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Возвращаем мок-данные
      const mockEmployeeData = generateEmployeeFullMetrics(employeeId);
      return { data: mockEmployeeData.employee };
    }
    
    // Реальный запрос к API
    return axios.get(`${EMPLOYEE_API_URL}/${employeeId}`);
  },
  
  /**
   * Получение данных продаж сотрудника
   * @param {string} id - ID сотрудника ('me' для текущего пользователя)
   * @returns {Promise} - Промис с ответом от сервера
   */
  getEmployeeSalesData: async (id) => {
    const employeeId = id === 'me' ? 'current' : id;
    
    // Проверяем, нужно ли использовать мок-данные
    if (shouldUseMockData()) {
      console.log('employeeService: используем мок-данные для продаж сотрудника', { employeeId });
      
      // Имитация задержки API запроса
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Возвращаем мок-данные
      const mockData = await fetchAllMockData(500);
      return { data: mockData };
    }
    
    // Реальный запрос к API
    return axios.get(`${EMPLOYEE_API_URL}/${employeeId}/sales`);
  },
  
  /**
   * Обновление данных сотрудника
   * @param {string} id - ID сотрудника
   * @param {Object} data - Данные для обновления
   * @returns {Promise} - Промис с ответом от сервера
   */
  updateEmployee: async (id, data) => {
    const employeeId = id === 'me' ? 'current' : id;
    
    // Проверяем, нужно ли использовать мок-данные
    if (shouldUseMockData()) {
      console.log('employeeService: имитация обновления данных сотрудника', { employeeId, data });
      
      // Имитация задержки API запроса
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Имитируем успешный ответ
      return { data: { success: true, message: 'Данные успешно обновлены' } };
    }
    
    // Реальный запрос к API
    return axios.patch(`${EMPLOYEE_API_URL}/${employeeId}`, data);
  },
  
  /**
   * Получение списка сотрудников
   * @param {Object} filters - Фильтры для запроса
   * @returns {Promise} - Промис с ответом от сервера
   */
  getEmployees: async (filters = {}) => {
    // Проверяем, нужно ли использовать мок-данные
    if (shouldUseMockData()) {
      console.log('employeeService: используем мок-данные для списка сотрудников', { filters });
      
      // Имитация задержки API запроса
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Здесь можно было бы добавить генерацию мок-данных для списка сотрудников
      return { data: [] };
    }
    
    // Реальный запрос к API
    return axios.get(EMPLOYEE_API_URL, { params: filters });
  }
};

export default employeeService;