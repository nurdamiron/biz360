// src/hooks/useCustomers.js
import { useState, useEffect, useCallback, useRef } from 'react';
import * as customerService from 'src/services/customerService';

/**
 * Хук для работы с данными клиентов
 * Обеспечивает доступ к API клиентов с поддержкой кеширования, состояний загрузки и ошибок
 * 
 * @param {Object} options - Опции хука
 * @returns {Object} - Состояние и методы для работы с клиентами
 */
export function useCustomers(options = {}) {
  const {
    fetchOnMount = true,     // Загружать ли данные при монтировании компонента
    defaultLimit = 10,       // Количество записей на странице по умолчанию
    defaultOrderBy = 'name', // Поле сортировки по умолчанию
    defaultOrder = 'asc',    // Направление сортировки по умолчанию
    defaultSearch = '',      // Поисковый запрос по умолчанию
    defaultStatus = '',      // Статус клиента по умолчанию
    cacheTime = 5 * 60 * 1000 // Время кеширования данных (5 минут по умолчанию)
  } = options;

  // Состояния для данных
  const [customers, setCustomers] = useState([]);
  const [completedDeals, setCompletedDeals] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState(null);
  const [customerDeals, setCustomerDeals] = useState([]);

  // Состояния для пагинации и фильтрации
  const [pagination, setPagination] = useState({
    total: 0,
    limit: defaultLimit,
    offset: 0,
    page: 1,
    pages: 1
  });
  
  const [filters, setFilters] = useState({
    search: defaultSearch,
    orderBy: defaultOrderBy,
    order: defaultOrder,
    status: defaultStatus
  });

  // Состояния для UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Кеш для оптимизации повторных запросов
  const cache = useRef({
    list: {},               // Кеш для списков клиентов
    details: {},            // Кеш для деталей клиента
    history: {},            // Кеш для истории клиента
    deals: {},              // Кеш для сделок клиента
    timestamp: Date.now()   // Время последнего обновления кеша
  });

  // Очистка кеша при необходимости
  const clearCacheIfExpired = useCallback(() => {
    const now = Date.now();
    if (now - cache.current.timestamp > cacheTime) {
      console.log('useCustomers: кеш устарел, очищаем');
      cache.current = {
        list: {},
        details: {},
        history: {},
        deals: {},
        timestamp: now
      };
    }
  }, [cacheTime]);

  // Генерация ключа кеша для списка клиентов
  const getListCacheKey = useCallback(({ limit, offset, search, orderBy, order, status }) => 
    `list_${limit}_${offset}_${search}_${orderBy}_${order}_${status}`
  , []);

  // Функция загрузки списка клиентов
  const fetchCustomers = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Объединяем параметры с текущими фильтрами
      const queryParams = {
        ...filters,
        limit: pagination.limit,
        offset: pagination.offset,
        ...params
      };
      
      // Проверяем наличие данных в кеше
      clearCacheIfExpired();
      const cacheKey = getListCacheKey(queryParams);
      
      if (cache.current.list[cacheKey]) {
        console.log('useCustomers: возвращаем данные из кеша', { cacheKey });
        const cachedData = cache.current.list[cacheKey];
        setCustomers(cachedData.items);
        setPagination({
          total: cachedData.total,
          limit: cachedData.limit,
          offset: cachedData.offset,
          page: cachedData.page,
          pages: cachedData.pages
        });
        setLoading(false);
        return cachedData;
      }
      
      // Если данных нет в кеше, делаем запрос к API
      console.log('useCustomers: загрузка списка клиентов', queryParams);
      const response = await customerService.getCustomers(queryParams);
      
      if (!response.success) {
        throw new Error(response.message || 'Не удалось загрузить список клиентов');
      }
      
      const { items, total, limit, offset, page, pages } = response.data;
      
      // Сохраняем данные
      setCustomers(items);
      setPagination({
        total,
        limit,
        offset,
        page,
        pages
      });
      
      // Обновляем кеш
      cache.current.list[cacheKey] = response.data;
      cache.current.timestamp = Date.now();
      
      return response.data;
    } catch (err) {
      console.error('Ошибка при загрузке списка клиентов:', err);
      setError(err.message || 'Не удалось загрузить список клиентов');
      return null;
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.offset, clearCacheIfExpired, getListCacheKey]);

  // Обновление фильтров и перезагрузка данных
  const updateFilters = useCallback((newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
    // Сбрасываем пагинацию при изменении фильтров
    setPagination(prev => ({
      ...prev,
      offset: 0,
      page: 1
    }));
    
    // Перезагружаем данные с новыми фильтрами
    fetchCustomers({
      ...newFilters,
      offset: 0
    });
  }, [fetchCustomers]);

  // Обновление пагинации и перезагрузка данных
  const updatePagination = useCallback((newPagination) => {
    setPagination(prevPagination => ({
      ...prevPagination,
      ...newPagination,
      // Вычисляем смещение на основе страницы и размера страницы
      offset: newPagination.page 
        ? (newPagination.page - 1) * (newPagination.limit || prevPagination.limit)
        : (newPagination.offset !== undefined ? newPagination.offset : prevPagination.offset)
    }));
    
    // Определяем параметры для перезагрузки данных
    const reloadParams = {};
    
    if (newPagination.limit !== undefined) {
      reloadParams.limit = newPagination.limit;
    }
    
    if (newPagination.page !== undefined) {
      reloadParams.offset = (newPagination.page - 1) * (newPagination.limit || pagination.limit);
    } else if (newPagination.offset !== undefined) {
      reloadParams.offset = newPagination.offset;
    }
    
    // Перезагружаем данные с новой пагинацией
    fetchCustomers(reloadParams);
  }, [fetchCustomers, pagination.limit]);

  // Загрузка деталей клиента по ID
  const fetchCustomerById = useCallback(async (id) => {
    if (!id) {
      console.warn('useCustomers: ID клиента не указан');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Проверяем наличие данных в кеше
      clearCacheIfExpired();
      const cacheKey = `details_${id}`;
      
      if (cache.current.details[cacheKey]) {
        console.log('useCustomers: возвращаем детали клиента из кеша', { id });
        const cachedData = cache.current.details[cacheKey];
        setSelectedCustomer(cachedData);
        setLoading(false);
        return cachedData;
      }
      
      // Если данных нет в кеше, делаем запрос к API
      console.log('useCustomers: загрузка деталей клиента', { id });
      const response = await customerService.getCustomerById(id);
      
      if (!response.success) {
        throw new Error(response.message || `Не удалось загрузить детали клиента ID ${id}`);
      }
      
      // Сохраняем данные
      setSelectedCustomer(response.data);
      
      // Обновляем кеш
      cache.current.details[cacheKey] = response.data;
      cache.current.timestamp = Date.now();
      
      return response.data;
    } catch (err) {
      console.error(`Ошибка при загрузке деталей клиента ID ${id}:`, err);
      setError(err.message || `Не удалось загрузить детали клиента ID ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearCacheIfExpired]);

  // Загрузка истории клиента
  const fetchCustomerHistory = useCallback(async (id) => {
    if (!id) {
      console.warn('useCustomers: ID клиента не указан для загрузки истории');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Проверяем наличие данных в кеше
      clearCacheIfExpired();
      const cacheKey = `history_${id}`;
      
      if (cache.current.history[cacheKey]) {
        console.log('useCustomers: возвращаем историю клиента из кеша', { id });
        const cachedData = cache.current.history[cacheKey];
        setCustomerHistory(cachedData);
        setLoading(false);
        return cachedData;
      }
      
      // Если данных нет в кеше, делаем запрос к API
      console.log('useCustomers: загрузка истории клиента', { id });
      const response = await customerService.getCustomerHistory(id);
      
      if (!response.success) {
        throw new Error(response.message || `Не удалось загрузить историю клиента ID ${id}`);
      }
      
      // Сохраняем данные
      setCustomerHistory(response.data);
      
      // Обновляем кеш
      cache.current.history[cacheKey] = response.data;
      cache.current.timestamp = Date.now();
      
      return response.data;
    } catch (err) {
      console.error(`Ошибка при загрузке истории клиента ID ${id}:`, err);
      setError(err.message || `Не удалось загрузить историю клиента ID ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearCacheIfExpired]);

  // Загрузка сделок клиента
  const fetchCustomerDeals = useCallback(async (id) => {
    if (!id) {
      console.warn('useCustomers: ID клиента не указан для загрузки сделок');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Проверяем наличие данных в кеше
      clearCacheIfExpired();
      const cacheKey = `deals_${id}`;
      
      if (cache.current.deals[cacheKey]) {
        console.log('useCustomers: возвращаем сделки клиента из кеша', { id });
        const cachedData = cache.current.deals[cacheKey];
        setCustomerDeals(cachedData.deals);
        setLoading(false);
        return cachedData;
      }
      
      // Если данных нет в кеше, делаем запрос к API
      console.log('useCustomers: загрузка сделок клиента', { id });
      const response = await customerService.getCustomerDeals(id);
      
      if (!response.success) {
        throw new Error(response.message || `Не удалось загрузить сделки клиента ID ${id}`);
      }
      
      // Сохраняем данные
      setCustomerDeals(response.data.deals);
      
      // Обновляем кеш
      cache.current.deals[cacheKey] = response.data;
      cache.current.timestamp = Date.now();
      
      return response.data;
    } catch (err) {
      console.error(`Ошибка при загрузке сделок клиента ID ${id}:`, err);
      setError(err.message || `Не удалось загрузить сделки клиента ID ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearCacheIfExpired]);

  // Создание нового клиента
  const createCustomer = useCallback(async (customerData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      // Отправляем запрос на создание
      console.log('useCustomers: создание нового клиента', customerData);
      const response = await customerService.createCustomer(customerData);
      
      if (!response.success) {
        throw new Error(response.message || 'Не удалось создать клиента');
      }
      
      // Показываем сообщение об успехе
      setSuccessMessage(response.message || 'Клиент успешно создан');
      
      // Очищаем кеш списка клиентов, так как данные изменились
      clearCacheIfExpired();
      cache.current.list = {};
      
      // Перезагружаем список клиентов
      fetchCustomers();
      
      return response.data;
    } catch (err) {
      console.error('Ошибка при создании клиента:', err);
      setError(err.message || 'Не удалось создать клиента');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers, clearCacheIfExpired]);

  // Обновление клиента
  const updateCustomer = useCallback(async (id, customerData) => {
    if (!id) {
      console.warn('useCustomers: ID клиента не указан для обновления');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      // Отправляем запрос на обновление
      console.log('useCustomers: обновление клиента', { id, customerData });
      const response = await customerService.updateCustomer(id, customerData);
      
      if (!response.success) {
        throw new Error(response.message || `Не удалось обновить клиента ID ${id}`);
      }
      
      // Показываем сообщение об успехе
      setSuccessMessage(response.message || 'Клиент успешно обновлен');
      
      // Если это выбранный клиент, обновляем его данные
      if (selectedCustomer && selectedCustomer.id == id) {
        setSelectedCustomer(response.data);
        
        // Обновляем кеш деталей клиента
        cache.current.details[`details_${id}`] = response.data;
      }
      
      // Очищаем кеш списка клиентов, так как данные изменились
      cache.current.list = {};
      
      // Перезагружаем список клиентов
      fetchCustomers();
      
      return response.data;
    } catch (err) {
      console.error(`Ошибка при обновлении клиента ID ${id}:`, err);
      setError(err.message || `Не удалось обновить клиента ID ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedCustomer, fetchCustomers]);

  // Удаление клиента
  const deleteCustomer = useCallback(async (id) => {
    if (!id) {
      console.warn('useCustomers: ID клиента не указан для удаления');
      return false;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      // Отправляем запрос на удаление
      console.log('useCustomers: удаление клиента', { id });
      const response = await customerService.deleteCustomer(id);
      
      if (!response.success) {
        throw new Error(response.message || `Не удалось удалить клиента ID ${id}`);
      }
      
      // Показываем сообщение об успехе
      setSuccessMessage(response.message || 'Клиент успешно удален');
      
      // Если это выбранный клиент, сбрасываем его
      if (selectedCustomer && selectedCustomer.id == id) {
        setSelectedCustomer(null);
      }
      
      // Очищаем кеш, так как данные изменились
      cache.current.details[`details_${id}`] = null;
      cache.current.history[`history_${id}`] = null;
      cache.current.deals[`deals_${id}`] = null;
      cache.current.list = {};
      
      // Перезагружаем список клиентов
      fetchCustomers();
      
      return true;
    } catch (err) {
      console.error(`Ошибка при удалении клиента ID ${id}:`, err);
      setError(err.message || `Не удалось удалить клиента ID ${id}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedCustomer, fetchCustomers]);

  // Сброс состояния ошибки
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Сброс сообщения об успехе
  const resetSuccessMessage = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    if (fetchOnMount) {
      fetchCustomers();
    }
  }, [fetchOnMount, fetchCustomers]);

  // Возвращаем все данные и методы для использования в компонентах
  return {
    // Данные
    customers,                  // Список клиентов
    completedDeals,             // Завершенные сделки
    selectedCustomer,           // Выбранный клиент
    customerHistory,            // История клиента
    customerDeals,              // Сделки клиента
    pagination,                 // Информация о пагинации
    filters,                    // Текущие фильтры
    
    // Состояния UI
    loading,                    // Флаг загрузки
    error,                      // Сообщение об ошибке
    successMessage,             // Сообщение об успехе
    
    // Методы для работы с данными
    fetchCustomers,             // Загрузка списка клиентов
    fetchCustomerById,          // Загрузка деталей клиента
    fetchCustomerHistory,       // Загрузка истории клиента
    fetchCustomerDeals,         // Загрузка сделок клиента
    createCustomer,             // Создание клиента
    updateCustomer,             // Обновление клиента
    deleteCustomer,             // Удаление клиента
    
    // Методы для UI
    updateFilters,              // Обновление фильтров
    updatePagination,           // Обновление пагинации
    resetError,                 // Сброс ошибки
    resetSuccessMessage,        // Сброс сообщения об успехе
    
    // Константы и вспомогательные функции
    CLIENT_STATUSES: customerService.CLIENT_STATUSES // Статусы клиентов
  };
}

export default useCustomers;