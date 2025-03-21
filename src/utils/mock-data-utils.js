// src/utils/mock-data-utils.js
import { shouldUseMockData as globalShouldUseMockData } from 'src/global-config';

/**
 * Проверка необходимости использования мок-данных
 * Обертка над функцией из глобальных настроек для обратной совместимости
 * @returns {boolean} - true, если нужно использовать мок-данные
 */
export const shouldUseMockData = () => globalShouldUseMockData();

/**
 * Функция для имитации запроса API с задержкой
 * @param {*} data - Данные, которые нужно вернуть
 * @param {number} delay - Задержка в мс
 * @returns {Promise} - Промис с переданными данными
 */
export const mockApiCall = (data, delay = 500) => {
  console.log('mockApiCall: имитация API запроса с задержкой', { delay });
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
};

/**
 * Получение случайной задержки для имитации API запроса
 * @param {number} min - Минимальная задержка в мс
 * @param {number} max - Максимальная задержка в мс
 * @returns {number} - Случайная задержка в мс
 */
export const getRandomDelay = (min = 300, max = 1200) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Функция для получения мок-данных с имитацией API-запроса
 * @param {Object} mockData - Объект с мок-данными
 * @param {string} key - Ключ для доступа к определенным данным
 * @param {number} delay - Задержка в мс
 * @returns {Promise} - Промис с данными
 */
export const getMockData = (mockData, key, delay = 500) => {
  console.log('getMockData: запрос мок-данных', { key, delay });
  
  if (!mockData[key]) {
    console.warn(`getMockData: данные для ключа "${key}" не найдены`);
    return mockApiCall(null, delay);
  }
  
  return mockApiCall(mockData[key], delay);
};

/**
 * Переключение режима мок-данных (для тестирования)
 * @param {boolean} useMock - Использовать ли мок-данные
 */
export const setMockDataMode = (useMock) => {
  console.log(`setMockDataMode: ${useMock ? 'включение' : 'отключение'} режима мок-данных`);
  // Здесь можно было бы сохранить значение в localStorage, 
  // но это бы конфликтовало с глобальными настройками
  // window.localStorage.setItem('useMockData', useMock ? 'true' : 'false');
};