// src/services/mock/mockUtils.js

/**
 * Функция для генерации случайного целого числа в заданном диапазоне
 * @param {number} min - Минимальное значение (включительно)
 * @param {number} max - Максимальное значение (включительно)
 * @returns {number} - Случайное целое число
 */
export function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Функция для выбора случайного элемента из массива
 * @param {Array} array - Исходный массив
 * @returns {any} - Случайный элемент массива
 */
export function randomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Функция для генерации случайного числа с плавающей точкой в заданном диапазоне
 * @param {number} min - Минимальное значение (включительно)
 * @param {number} max - Максимальное значение (включительно)
 * @param {number} decimals - Количество знаков после запятой
 * @returns {number} - Случайное число с плавающей точкой
 */
export function randomFloat(min, max, decimals = 2) {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

/**
 * Функция для задержки выполнения
 * @param {number} ms - Задержка в миллисекундах
 * @returns {Promise<void>} - Promise, который разрешается после указанной задержки
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Функция для генерации случайной даты в заданном диапазоне
 * @param {Date} start - Начальная дата
 * @param {Date} end - Конечная дата
 * @returns {Date} - Случайная дата в заданном диапазоне
 */
export function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Функция для определения, следует ли использовать моковые данные
 * @returns {boolean} - true, если нужно использовать моковые данные
 */
export function shouldUseMockData() {
  // В реальном приложении здесь может быть проверка окружения, конфигурации и т.д.
  return process.env.NODE_ENV === 'development' || !process.env.REACT_APP_API_URL;
}

/**
 * Функция для генерации случайного идентификатора
 * @param {number} length - Длина идентификатора
 * @returns {string} - Случайный идентификатор
 */
export function generateId(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Функция для форматирования даты в строку для отображения
 * @param {Date|string} date - Дата для форматирования
 * @param {string} format - Формат даты (dd.mm.yyyy, yyyy-mm-dd и т.д.)
 * @returns {string} - Отформатированная дата
 */
export function formatDate(date, format = 'dd.mm.yyyy') {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  switch (format) {
    case 'dd.mm.yyyy':
      return `${day}.${month}.${year}`;
    case 'yyyy-mm-dd':
      return `${year}-${month}-${day}`;
    case 'dd/mm/yyyy':
      return `${day}/${month}/${year}`;
    default:
      return `${day}.${month}.${year}`;
  }
}

/**
 * Моковая реализация API-запроса с имитацией задержки
 * @param {any} data - Данные для возврата
 * @param {number} delayMs - Задержка в миллисекундах
 * @param {boolean} shouldFail - Флаг, должен ли запрос завершиться ошибкой
 * @returns {Promise<any>} - Promise с данными или ошибкой
 */
export async function mockApiCall(data, delayMs = 500, shouldFail = false) {
  await delay(delayMs);
  
  if (shouldFail) {
    throw new Error('Симуляция ошибки API');
  }
  
  return data;
}