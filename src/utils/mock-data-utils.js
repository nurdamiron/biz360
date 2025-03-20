// src/utils/mock-data-utils.js

/**
 * Утилиты для работы с мок-данными
 * Обеспечивает единую точку контроля использования мок-данных во всем приложении
 */

// Глобальный флаг для определения, использовать ли мок-данные
// В продакшене или при наличии API установите в false
let ENABLE_MOCK_DATA = true;

/**
 * Проверка необходимости использования мок-данных
 * @returns {boolean} True если следует использовать мок-данные
 */
export const shouldUseMockData = () => {
  console.log('shouldUseMockData: проверка использования мок-данных', { 
    ENABLE_MOCK_DATA,
    environment: process.env.NODE_ENV
  });
  
  // В production среде мок-данные отключены принудительно
  if (process.env.NODE_ENV === 'production') {
    console.log('shouldUseMockData: среда production, мок-данные отключены');
    return false;
  }
  
  return ENABLE_MOCK_DATA;
};

/**
 * Включение/отключение мок-данных вручную
 * @param {boolean} enabled - Флаг включения мок-данных
 * @returns {boolean} Новое состояние флага
 */
export const setMockDataEnabled = (enabled) => {
  console.log(`setMockDataEnabled: ${enabled ? 'включение' : 'отключение'} режима мок-данных`);
  ENABLE_MOCK_DATA = !!enabled;
  return ENABLE_MOCK_DATA;
};

/**
 * Функция для имитации запроса с задержкой
 * @param {*} data - Данные, которые нужно вернуть
 * @param {number} delay - Задержка в мс
 * @returns {Promise<*>} Промис с данными
 */
export const mockApiCall = (data, delay = 500) => {
  console.log('mockApiCall: имитация API запроса с задержкой', { delay });
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
};

/**
 * Получение мок-данных с имитацией API-запроса
 * @param {Object} mockData - Объект с мок-данными
 * @param {string} key - Ключ для доступа к определенным данным
 * @param {number} delay - Задержка в мс
 * @returns {Promise<*>} Промис с запрошенными данными
 */
export const getMockData = (mockData, key, delay = 500) => {
  console.log('getMockData: запрос мок-данных', { key, delay });
  
  if (!mockData[key]) {
    console.warn(`getMockData: данные для ключа "${key}" не найдены`);
    return mockApiCall(null, delay);
  }
  
  return mockApiCall(mockData[key], delay);
};