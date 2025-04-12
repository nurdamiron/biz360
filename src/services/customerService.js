// src/services/customerService.js
import axios from 'src/lib/axios';
import { shouldUseMockData } from 'src/utils/mock-data-utils';
import { mockActiveClients, mockCompletedDeals } from 'src/sections/sales/_mock/sales-mock-data';
import { clientHistoryMock, CLIENT_STATUSES } from 'src/sections/sales/_mock/lead-history-mock';

/**
 * Сервис для работы с API клиентов
 * Предоставляет методы для получения, создания, обновления и удаления клиентов
 * Поддерживает как реальные API запросы, так и мок-данные для разработки
 */

// Базовое время задержки для мок-запросов (мс)
const MOCK_DELAY = 800;

/**
 * Получение списка клиентов с фильтрацией, сортировкой и пагинацией
 * 
 * @param {Object} options - Параметры запроса
 * @param {string} options.search - Поисковый запрос
 * @param {number} options.limit - Количество записей на странице
 * @param {number} options.offset - Смещение для пагинации
 * @param {string} options.orderBy - Поле для сортировки
 * @param {string} options.order - Направление сортировки (asc, desc)
 * @param {string} options.status - Фильтр по статусу
 * @returns {Promise<Object>} - Результат запроса с данными клиентов и пагинацией
 */
export const getCustomers = async (options = {}) => {
  try {
    const {
      search = '',
      limit = 10,
      offset = 0,
      orderBy = 'name',
      order = 'asc',
      status = '',
    } = options;

    // Если используем мок-данные
    if (shouldUseMockData()) {
      console.log('customerService: используем мок-данные для списка клиентов');
      
      // Имитация задержки как в реальном API
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      // Получаем все мок-данные
      let filteredClients = [...mockActiveClients];
      
      // Применяем фильтрацию по поиску
      if (search) {
        const searchLower = search.toLowerCase();
        filteredClients = filteredClients.filter(client => 
          client.name.toLowerCase().includes(searchLower)
        );
      }
      
      // Применяем фильтрацию по статусу
      if (status) {
        filteredClients = filteredClients.filter(client => 
          client.status === status
        );
      }
      
      // Применяем сортировку
      filteredClients.sort((a, b) => {
        // Сравниваем значения полей
        let valueA = a[orderBy];
        let valueB = b[orderBy];
        
        // Для строковых полей делаем сортировку регистронезависимой
        if (typeof valueA === 'string') valueA = valueA.toLowerCase();
        if (typeof valueB === 'string') valueB = valueB.toLowerCase();
        
        // Сортировка по возрастанию/убыванию
        if (order.toLowerCase() === 'asc') {
          return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        } else {
          return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
        }
      });
      
      // Имитируем пагинацию
      const paginatedClients = filteredClients.slice(offset, offset + limit);
      
      // Формируем ответ в формате, соответствующем API
      return {
        success: true,
        data: {
          items: paginatedClients,
          total: filteredClients.length,
          limit,
          offset,
          page: Math.floor(offset / limit) + 1,
          pages: Math.ceil(filteredClients.length / limit)
        }
      };
    } 
    
    // Если используем реальный API
    console.log('customerService: используем реальный API для списка клиентов');
    
    // Формируем параметры запроса
    const params = {
      search,
      limit,
      offset,
      orderBy,
      order,
      status
    };
    
    // Отправляем запрос к API
    const response = await axios.get('/api/customers', { params });
    
    // Проверяем успешность запроса
    if (!response.data.success) {
      throw new Error(response.data.message || 'Не удалось получить список клиентов');
    }
    
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении списка клиентов:', error);
    throw error;
  }
};

/**
 * Получение детальной информации о клиенте по ID
 * 
 * @param {number|string} id - ID клиента
 * @returns {Promise<Object>} - Информация о клиенте
 */
export const getCustomerById = async (id) => {
  try {
    // Проверяем наличие ID
    if (!id) {
      throw new Error('ID клиента не указан');
    }
    
    // Если используем мок-данные
    if (shouldUseMockData()) {
      console.log(`customerService: используем мок-данные для клиента ID ${id}`);
      
      // Имитация задержки
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      // Сначала ищем в активных клиентах
      let client = mockActiveClients.find(c => c.id == id); // Используем == для сравнения строк и чисел
      
      if (!client) {
        // Если не найден, ищем в истории клиентов
        client = clientHistoryMock.find(c => c.id == id);
      }
      
      // Если клиент не найден
      if (!client) {
        throw new Error(`Клиент с ID ${id} не найден`);
      }
      
      // Формируем ответ в формате API
      return {
        success: true,
        data: client
      };
    }
    
    // Если используем реальный API
    console.log(`customerService: используем реальный API для клиента ID ${id}`);
    
    // Отправляем запрос к API
    const response = await axios.get(`/api/customers/${id}`);
    
    // Проверяем успешность запроса
    if (!response.data.success) {
      throw new Error(response.data.message || `Не удалось получить информацию о клиенте ID ${id}`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении информации о клиенте ID ${id}:`, error);
    throw error;
  }
};

/**
 * Создание нового клиента
 * 
 * @param {Object} customerData - Данные нового клиента
 * @returns {Promise<Object>} - Созданный клиент
 */
export const createCustomer = async (customerData) => {
  try {
    // Проверка наличия обязательных полей
    if (!customerData || !customerData.name) {
      throw new Error('Название клиента обязательно');
    }
    
    // Если используем мок-данные
    if (shouldUseMockData()) {
      console.log('customerService: используем мок-данные для создания клиента', customerData);
      
      // Имитация задержки
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      // Создаем нового клиента с минимальными полями
      const newCustomer = {
        id: Date.now(), // Используем timestamp как уникальный ID
        ...customerData,
        // Устанавливаем значения по умолчанию для отсутствующих полей
        status: customerData.status || 'Новый клиент',
        potential_amount: customerData.potential_amount || 0,
        probability: customerData.probability || 20,
        urgency: customerData.urgency || 'Средняя',
      };
      
      // В реальном приложении здесь бы добавили клиента в локальное хранилище
      // или обновили состояние
      
      return {
        success: true,
        message: 'Клиент успешно создан',
        data: newCustomer
      };
    }
    
    // Если используем реальный API
    console.log('customerService: используем реальный API для создания клиента');
    
    // Отправляем запрос к API
    const response = await axios.post('/api/customers', customerData);
    
    // Проверяем успешность запроса
    if (!response.data.success) {
      throw new Error(response.data.message || 'Не удалось создать клиента');
    }
    
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании клиента:', error);
    throw error;
  }
};

/**
 * Обновление данных клиента
 * 
 * @param {number|string} id - ID клиента
 * @param {Object} customerData - Новые данные клиента
 * @returns {Promise<Object>} - Обновленный клиент
 */
export const updateCustomer = async (id, customerData) => {
  try {
    // Проверяем наличие ID
    if (!id) {
      throw new Error('ID клиента не указан');
    }
    
    // Если используем мок-данные
    if (shouldUseMockData()) {
      console.log(`customerService: используем мок-данные для обновления клиента ID ${id}`, customerData);
      
      // Имитация задержки
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      // В реальном приложении здесь бы обновили клиента в локальном хранилище
      
      return {
        success: true,
        message: 'Клиент успешно обновлен',
        data: {
          id,
          ...customerData
        }
      };
    }
    
    // Если используем реальный API
    console.log(`customerService: используем реальный API для обновления клиента ID ${id}`);
    
    // Отправляем запрос к API
    const response = await axios.put(`/api/customers/${id}`, customerData);
    
    // Проверяем успешность запроса
    if (!response.data.success) {
      throw new Error(response.data.message || `Не удалось обновить клиента ID ${id}`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Ошибка при обновлении клиента ID ${id}:`, error);
    throw error;
  }
};

/**
 * Удаление клиента
 * 
 * @param {number|string} id - ID клиента
 * @returns {Promise<Object>} - Результат удаления
 */
export const deleteCustomer = async (id) => {
  try {
    // Проверяем наличие ID
    if (!id) {
      throw new Error('ID клиента не указан');
    }
    
    // Если используем мок-данные
    if (shouldUseMockData()) {
      console.log(`customerService: используем мок-данные для удаления клиента ID ${id}`);
      
      // Имитация задержки
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      // В реальном приложении здесь бы удалили клиента из локального хранилища
      
      return {
        success: true,
        message: 'Клиент успешно удален'
      };
    }
    
    // Если используем реальный API
    console.log(`customerService: используем реальный API для удаления клиента ID ${id}`);
    
    // Отправляем запрос к API
    const response = await axios.delete(`/api/customers/${id}`);
    
    // Проверяем успешность запроса
    if (!response.data.success) {
      throw new Error(response.data.message || `Не удалось удалить клиента ID ${id}`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Ошибка при удалении клиента ID ${id}:`, error);
    throw error;
  }
};

/**
 * Получение истории взаимодействия с клиентом
 * 
 * @param {number|string} id - ID клиента
 * @returns {Promise<Object>} - История взаимодействия с клиентом
 */
export const getCustomerHistory = async (id) => {
  try {
    // Проверяем наличие ID
    if (!id) {
      throw new Error('ID клиента не указан');
    }
    
    // Если используем мок-данные
    if (shouldUseMockData()) {
      console.log(`customerService: используем мок-данные для истории клиента ID ${id}`);
      
      // Имитация задержки
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      // Ищем клиента в истории клиентов
      const clientHistory = clientHistoryMock.find(c => c.id == id);
      
      // Если история не найдена
      if (!clientHistory) {
        throw new Error(`История клиента с ID ${id} не найдена`);
      }
      
      // Формируем ответ в формате API
      return {
        success: true,
        data: clientHistory
      };
    }
    
    // Если используем реальный API
    console.log(`customerService: используем реальный API для истории клиента ID ${id}`);
    
    // Отправляем запрос к API
    const response = await axios.get(`/api/customers/${id}/history`);
    
    // Проверяем успешность запроса
    if (!response.data.success) {
      throw new Error(response.data.message || `Не удалось получить историю клиента ID ${id}`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении истории клиента ID ${id}:`, error);
    throw error;
  }
};

/**
 * Получение сделок клиента
 * 
 * @param {number|string} id - ID клиента
 * @returns {Promise<Object>} - Сделки клиента
 */
export const getCustomerDeals = async (id) => {
  try {
    // Проверяем наличие ID
    if (!id) {
      throw new Error('ID клиента не указан');
    }
    
    // Если используем мок-данные
    if (shouldUseMockData()) {
      console.log(`customerService: используем мок-данные для сделок клиента ID ${id}`);
      
      // Имитация задержки
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      // Фильтруем завершенные сделки по клиенту
      // Здесь предполагается, что имя клиента в сделке совпадает с именем клиента
      const client = mockActiveClients.find(c => c.id == id) || 
                    clientHistoryMock.find(c => c.id == id);
      
      if (!client) {
        throw new Error(`Клиент с ID ${id} не найден`);
      }
      
      // Фильтруем сделки по имени клиента
      const clientDeals = mockCompletedDeals.filter(deal => 
        deal.client === client.name
      );
      
      // Формируем ответ в формате API
      return {
        success: true,
        data: {
          deals: clientDeals,
          total: clientDeals.length
        }
      };
    }
    
    // Если используем реальный API
    console.log(`customerService: используем реальный API для сделок клиента ID ${id}`);
    
    // Отправляем запрос к API
    const response = await axios.get(`/api/customers/${id}/deals`);
    
    // Проверяем успешность запроса
    if (!response.data.success) {
      throw new Error(response.data.message || `Не удалось получить сделки клиента ID ${id}`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении сделок клиента ID ${id}:`, error);
    throw error;
  }
};

// Экспорт констант из мок-данных для использования в компонентах
export { CLIENT_STATUSES };

// Экспорт всего сервиса как объекта для удобства импорта
export default {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerHistory,
  getCustomerDeals,
  CLIENT_STATUSES
};