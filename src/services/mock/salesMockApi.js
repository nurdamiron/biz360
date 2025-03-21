// src/services/mock/salesMockApi.js
import { randomInRange, randomFromArray, delay } from './mockUtils';

/**
 * Конфигурация мок-сервиса
 */
const CONFIG = {
  MOCK_ENABLED: true,
  RESPONSE_DELAY: {
    MIN: 300,
    MAX: 800
  },
  ERROR_PROBABILITY: 0.05, // Вероятность симуляции ошибки (5%)
};

/**
 * Мок-данные для лидов
 */
const LEADS = [
  {
    id: 101,
    name: 'ООО "ТехноПрогресс"',
    contact: 'Артем Васильев',
    email: 'a.vasilev@technoprogress.ru',
    phone: '+7 (901) 234-56-78',
    status: 'Новый',
    source: 'Сайт',
    created_at: '2025-03-15T10:30:00',
    priority: 'Высокий',
    potential_amount: 450000,
    assigned_to: null,
    contact_deadline: '17.03.2025'
  },
  {
    id: 102,
    name: 'ИП Смирнов А.В.',
    contact: 'Андрей Смирнов',
    email: 'smirnov@example.com',
    phone: '+7 (902) 345-67-89',
    status: 'Новый',
    source: 'Звонок',
    created_at: '2025-03-16T11:45:00',
    priority: 'Средний',
    potential_amount: 120000,
    assigned_to: null,
    contact_deadline: '18.03.2025'
  },
  {
    id: 103,
    name: 'АО "МегаСтрой"',
    contact: 'Елена Иванова',
    email: 'e.ivanova@megastroy.ru',
    phone: '+7 (903) 456-78-90',
    status: 'Новый',
    source: 'Выставка',
    created_at: '2025-03-16T14:20:00',
    priority: 'Высокий',
    potential_amount: 780000,
    assigned_to: null,
    contact_deadline: '18.03.2025'
  },
  {
    id: 104,
    name: 'ООО "ИнфоСервис"',
    contact: 'Дмитрий Петров',
    email: 'd.petrov@infoservice.ru',
    phone: '+7 (904) 567-89-01',
    status: 'Новый',
    source: 'Рекомендация',
    created_at: '2025-03-17T09:10:00',
    priority: 'Низкий',
    potential_amount: 95000,
    assigned_to: null,
    contact_deadline: '19.03.2025'
  },
  {
    id: 105,
    name: 'ООО "АвтоТрейд"',
    contact: 'Сергей Николаев',
    email: 's.nikolaev@autotrade.ru',
    phone: '+7 (905) 678-90-12',
    status: 'Новый',
    source: 'Сайт',
    created_at: '2025-03-17T13:40:00',
    priority: 'Средний',
    potential_amount: 320000,
    assigned_to: null,
    contact_deadline: '19.03.2025'
  },
  {
    id: 106,
    name: 'ЗАО "ЭнергоСистемы"',
    contact: 'Ольга Козлова',
    email: 'o.kozlova@energosystems.ru',
    phone: '+7 (906) 789-01-23',
    status: 'Новый',
    source: 'Конференция',
    created_at: '2025-03-18T10:15:00',
    priority: 'Высокий',
    potential_amount: 920000,
    assigned_to: 1,
    contact_deadline: '20.03.2025'
  },
  {
    id: 107,
    name: 'ИП Кузнецов И.С.',
    contact: 'Игорь Кузнецов',
    email: 'kuznetsov@example.com',
    phone: '+7 (907) 890-12-34',
    status: 'Первичный контакт',
    source: 'Звонок',
    created_at: '2025-03-15T16:50:00',
    priority: 'Средний',
    potential_amount: 150000,
    assigned_to: 2,
    contact_deadline: '17.03.2025'
  },
  {
    id: 108,
    name: 'ООО "ФинТех"',
    contact: 'Марина Соколова',
    email: 'm.sokolova@fintech.ru',
    phone: '+7 (908) 901-23-45',
    status: 'Переговоры',
    source: 'Сайт',
    created_at: '2025-03-14T11:30:00',
    priority: 'Высокий',
    potential_amount: 580000,
    assigned_to: 3,
    contact_deadline: '16.03.2025'
  },
  {
    id: 109,
    name: 'ООО "ЭкоСтрой"',
    contact: 'Владимир Ковалев',
    email: 'v.kovalev@ecostroy.ru',
    phone: '+7 (909) 012-34-56',
    status: 'Согласование КП',
    source: 'Рекомендация',
    created_at: '2025-03-13T14:20:00',
    priority: 'Высокий',
    potential_amount: 720000,
    assigned_to: 4,
    contact_deadline: '15.03.2025'
  },
  {
    id: 110,
    name: 'ИП Белов М.А.',
    contact: 'Максим Белов',
    email: 'belov@example.com',
    phone: '+7 (910) 123-45-67',
    status: 'Выставлен счет',
    source: 'Звонок',
    created_at: '2025-03-12T09:45:00',
    priority: 'Средний',
    potential_amount: 190000,
    assigned_to: 1,
    contact_deadline: '14.03.2025'
  }
];

/**
 * Мок-данные для сотрудников отдела продаж
 */
const EMPLOYEES = [
  {
    id: 1,
    name: "Иванов Иван",
    role: "Старший менеджер",
    level: "Senior",
    avatar: null,
    color: "#4CAF50",
    capacity: 10,
    performance: 85,
    stats: {
      avgDealSize: 320000,
      conversionRate: 28,
      dealsThisMonth: 5
    }
  },
  {
    id: 2,
    name: "Петрова Анна",
    role: "Менеджер",
    level: "Middle",
    avatar: null,
    color: "#2196F3",
    capacity: 8,
    performance: 78,
    stats: {
      avgDealSize: 280000,
      conversionRate: 22,
      dealsThisMonth: 3
    }
  },
  {
    id: 3,
    name: "Сидоров Алексей",
    role: "Младший менеджер",
    level: "Junior",
    avatar: null,
    color: "#FFC107",
    capacity: 6,
    performance: 65,
    stats: {
      avgDealSize: 180000,
      conversionRate: 18,
      dealsThisMonth: 2
    }
  },
  {
    id: 4,
    name: "Козлова Екатерина",
    role: "Менеджер",
    level: "Middle",
    avatar: null,
    color: "#9C27B0",
    capacity: 8,
    performance: 72,
    stats: {
      avgDealSize: 260000,
      conversionRate: 20,
      dealsThisMonth: 4
    }
  }
];

/**
 * Мок-данные для источников лидов
 */
const LEAD_SOURCES = [
  { name: 'Сайт', count: 52, percent: 0.35, conversion: 18, value: 9400000 },
  { name: 'Звонок', count: 28, percent: 0.19, conversion: 24, value: 5600000 },
  { name: 'Рекомендация', count: 22, percent: 0.15, conversion: 32, value: 4900000 },
  { name: 'Выставка', count: 20, percent: 0.13, conversion: 16, value: 4200000 },
  { name: 'Конференция', count: 15, percent: 0.10, conversion: 20, value: 3500000 },
  { name: 'Холодные звонки', count: 8, percent: 0.05, conversion: 12, value: 1800000 },
  { name: 'Другие', count: 5, percent: 0.03, conversion: 15, value: 900000 }
];

/**
 * Мок-данные для воронки конверсии
 */
const CONVERSION_FUNNEL = [
  { name: 'Первый контакт', value: 100, description: 'Доля лидов, с которыми установлен контакт' },
  { name: 'Выявление потребности', value: 76, description: 'Доля лидов с выявленными потребностями' },
  { name: 'Презентация', value: 54, description: 'Доля лидов, получивших презентацию продукта' },
  { name: 'Коммерческое предложение', value: 36, description: 'Доля лидов, получивших КП' },
  { name: 'Согласование договора', value: 24, description: 'Доля лидов на этапе согласования' },
  { name: 'Закрытие сделки', value: 18, description: 'Доля лидов, с которыми закрыта сделка' }
];

/**
 * Мок-данные для статусов лидов
 */
const LEAD_STATUSES = [
  { name: 'Новый', value: 35, percent: 0.22, conversion: null, avgTime: null },
  { name: 'Первичный контакт', value: 28, percent: 0.18, conversion: 80, avgTime: '1 день' },
  { name: 'Квалифицирован', value: 25, percent: 0.16, conversion: 89, avgTime: '2 дня' },
  { name: 'Согласование КП', value: 20, percent: 0.13, conversion: 80, avgTime: '5 дней' },
  { name: 'Переговоры', value: 18, percent: 0.11, conversion: 90, avgTime: '7 дней' },
  { name: 'Подписание', value: 12, percent: 0.08, conversion: 67, avgTime: '3 дня' },
  { name: 'Закрыт (успех)', value: 8, percent: 0.05, conversion: 67, avgTime: '1 день' },
  { name: 'Закрыт (неудача)', value: 6, percent: 0.04, conversion: null, avgTime: null },
  { name: 'Отложен', value: 5, percent: 0.03, conversion: null, avgTime: null }
];

/**
 * Мок-данные для динамики показателей лидов по времени
 */
const LEAD_TIME_DATA = [
  { period: 'Янв', totalValue: 1850000, avgValue: 185000, count: 10, conversionRate: 16 },
  { period: 'Фев', totalValue: 2250000, avgValue: 195000, count: 12, conversionRate: 18 },
  { period: 'Мар', totalValue: 2700000, avgValue: 225000, count: 12, conversionRate: 20 },
  { period: 'Апр', totalValue: 3100000, avgValue: 240000, count: 13, conversionRate: 22 },
  { period: 'Май', totalValue: 2900000, avgValue: 242000, count: 12, conversionRate: 23 },
  { period: 'Июн', totalValue: 2600000, avgValue: 235000, count: 11, conversionRate: 21 },
  { period: 'Июл', totalValue: 2800000, avgValue: 255000, count: 11, conversionRate: 22 },
  { period: 'Авг', totalValue: 3250000, avgValue: 270000, count: 12, conversionRate: 24 },
  { period: 'Сен', totalValue: 3750000, avgValue: 285000, count: 13, conversionRate: 26 },
  { period: 'Окт', totalValue: 3950000, avgValue: 295000, count: 14, conversionRate: 25 },
  { period: 'Ноя', totalValue: 4250000, avgValue: 310000, count: 14, conversionRate: 26 },
  { period: 'Дек', totalValue: 4600000, avgValue: 320000, count: 15, conversionRate: 28 }
];

/**
 * Мок-данные для ключевых метрик лидов
 */
const LEAD_METRICS = {
  total_leads: 157,
  new_leads_today: 8,
  new_leads_week: 32,
  leads_in_progress: 102,
  leads_closed_success: 28,
  leads_closed_fail: 15,
  avg_response_time: 2.3, // часа
  avg_qualification_time: 1.8, // дней
  avg_deal_cycle: 18, // дней
  conversion_rate: 18, // процент
  avg_deal_value: 270000 // рублей
};

/**
 * Мок-данные для взаимодействий с лидами
 */
const LEAD_INTERACTIONS = [
  {
    id: 1,
    lead_id: 101,
    type: 'Звонок',
    date: '2025-03-15T11:30:00',
    duration: 12, // минуты
    result: 'Представлен продукт, клиент проявил интерес',
    notes: 'Запросил дополнительную информацию по срокам и интеграции с их системой',
    quality_score: 85,
    ai_feedback: 'Хорошее взаимодействие. Презентация продукта проведена четко, выявлены ключевые потребности клиента.',
    created_by: 1,
    recording_url: 'https://example.com/recordings/call-12345'
  },
  {
    id: 2,
    lead_id: 102,
    type: 'Email',
    date: '2025-03-16T13:15:00',
    duration: 0,
    result: 'Отправлена презентация продукта',
    notes: 'Приложены дополнительные материалы по интеграции',
    quality_score: 80,
    ai_feedback: null,
    created_by: 2
  },
  {
    id: 3,
    lead_id: 103,
    type: 'Встреча',
    date: '2025-03-16T15:00:00',
    duration: 45, // минуты
    result: 'Презентация продукта, демонстрация возможностей',
    notes: 'Клиент заинтересован, запросил коммерческое предложение',
    quality_score: 92,
    ai_feedback: 'Отличная презентация. Убедительно продемонстрированы преимущества продукта, отработаны все вопросы клиента.',
    created_by: 1
  },
  {
    id: 4,
    lead_id: 104,
    type: 'Звонок',
    date: '2025-03-17T10:20:00',
    duration: 8, // минуты
    result: 'Первичный контакт, выявление потребностей',
    notes: 'Клиент ищет простое решение, бюджет ограничен',
    quality_score: 75,
    ai_feedback: null,
    created_by: 3,
    recording_url: 'https://example.com/recordings/call-12346'
  },
  {
    id: 5,
    lead_id: 105,
    type: 'Звонок',
    date: '2025-03-17T14:45:00',
    duration: 18, // минуты
    result: 'Выявление потребностей, согласование демонстрации',
    notes: 'Клиент интересуется автоматизацией процессов, назначена демонстрация',
    quality_score: 82,
    ai_feedback: null,
    created_by: 2,
    recording_url: 'https://example.com/recordings/call-12347'
  }
];

/**
 * Функция для симуляции асинхронного ответа
 * @param {any} data - Данные для возврата
 * @param {Object} options - Опции
 * @returns {Promise<any>} - Результат
 */
async function mockResponse(data, options = {}) {
  // Проверка, включены ли мок-данные
  if (!CONFIG.MOCK_ENABLED) {
    throw new Error('Mock API отключен');
  }
  
  // Опции по умолчанию
  const { simulateError = false, delayMs = null } = options;
  
  // Случайная задержка, если не указана явно
  const responseDelay = delayMs || randomInRange(CONFIG.RESPONSE_DELAY.MIN, CONFIG.RESPONSE_DELAY.MAX);
  
  // Ждем указанное время
  await delay(responseDelay);
  
  // Симуляция ошибки с заданной вероятностью (если не требуется явная ошибка)
  if (simulateError || (!options.simulateError && Math.random() < CONFIG.ERROR_PROBABILITY)) {
    throw new Error('Симуляция ошибки API');
  }
  
  // Возвращаем данные
  return data;
}

/**
 * Вспомогательная функция для создания API
 * @param {Function} mockFn - Функция, возвращающая мок-данные
 * @param {Function} realFn - Функция для работы с реальным API
 * @returns {Function} - Функция для работы как с моками, так и с реальным API
 */
function createApiMethod(mockFn, realFn) {
    return async function(...args) {
      if (CONFIG.MOCK_ENABLED) {
        return mockFn(...args);
      } else {
        return realFn(...args);
      }
    };
  }

// API Методы

/**
 * Получение всех лидов
 */
export const getAllLeads = createApiMethod(
    async () => mockResponse(LEADS),
    async () => {
      // Реальный API запрос
      const response = await fetch('/api/leads');
      if (!response.ok) throw new Error('Ошибка при получении лидов');
      return response.json();
    }
  );

/**
 * Получение нераспределенных лидов
 */
export const getUnassignedLeads = createApiMethod(
    async () => {
      const unassignedLeads = LEADS.filter(lead => lead.assigned_to === null);
      return mockResponse(unassignedLeads);
    },
    async () => {
      // Реальный API запрос
      const response = await fetch('/api/leads/unassigned');
      if (!response.ok) throw new Error('Ошибка при получении нераспределенных лидов');
      return response.json();
    }
  );
  

/**
 * Получение лидов, назначенных конкретному сотруднику
 */
export const getEmployeeLeads = createApiMethod(
    async (employeeId) => {
      const employeeLeads = LEADS.filter(lead => lead.assigned_to === employeeId);
      return mockResponse(employeeLeads);
    },
    async (employeeId) => {
      // Реальный API запрос
      const response = await fetch(`/api/employees/${employeeId}/leads`);
      if (!response.ok) throw new Error(`Ошибка при получении лидов сотрудника ${employeeId}`);
      return response.json();
    }
  );

/**
 * Получение всех сотрудников отдела продаж
 */
export const getSalesEmployees = createApiMethod(
    async () => mockResponse(EMPLOYEES),
    async () => {
      // Реальный API запрос
      const response = await fetch('/api/employees/sales');
      if (!response.ok) throw new Error('Ошибка при получении сотрудников');
      return response.json();
    }
  );

/**
 * Назначение лида сотруднику
 */
export const assignLead = createApiMethod(
  async (leadId, employeeId) => {
    // Имитация обновления данных
    const leadIndex = LEADS.findIndex(lead => lead.id === leadId);
    if (leadIndex === -1) {
      return mockResponse(null, { simulateError: true });
    }
    
    // Обновляем данные в локальном хранилище
    LEADS[leadIndex] = { ...LEADS[leadIndex], assigned_to: employeeId };
    
    return mockResponse({ success: true, leadId, employeeId });
  },
  async (leadId, employeeId) => {
    // Реальный API запрос
    const response = await fetch(`/api/leads/${leadId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ employeeId })
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка при назначении лида ${leadId} сотруднику ${employeeId}`);
    }
    
    return response.json();
  }
);

/**
 * Получение аналитики по источникам лидов
 */
export const getLeadSourcesAnalytics = createApiMethod(
    async () => mockResponse(LEAD_SOURCES),
    async () => {
      // Реальный API запрос
      const response = await fetch('/api/analytics/lead-sources');
      if (!response.ok) throw new Error('Ошибка при получении аналитики по источникам');
      return response.json();
    }
  );

/**
 * Получение данных воронки конверсии
 */
export const getConversionFunnelData = createApiMethod(
    async () => mockResponse(CONVERSION_FUNNEL),
    async () => {
      // Реальный API запрос
      const response = await fetch('/api/analytics/conversion-funnel');
      if (!response.ok) throw new Error('Ошибка при получении данных воронки конверсии');
      return response.json();
    }
  );

/**
 * Получение распределения лидов по статусам
 */
export const getLeadsByStatusData = createApiMethod(
    async () => mockResponse(LEAD_STATUSES),
    async () => {
      // Реальный API запрос
      const response = await fetch('/api/analytics/leads-by-status');
      if (!response.ok) throw new Error('Ошибка при получении распределения лидов по статусам');
      return response.json();
    }
  );

/**
 * Получение динамики показателей лидов за период
 */
export const getLeadTimeData = createApiMethod(
    async (period = 'month') => mockResponse(LEAD_TIME_DATA),
    async (period = 'month') => {
      // Реальный API запрос
      const response = await fetch(`/api/analytics/leads-time-data?period=${period}`);
      if (!response.ok) throw new Error('Ошибка при получении динамики показателей лидов');
      return response.json();
    }
  );

/**
 * Получение ключевых метрик по лидам
 */
export const getLeadMetrics = createApiMethod(
    async () => mockResponse(LEAD_METRICS),
    async () => {
      // Реальный API запрос
      const response = await fetch('/api/analytics/lead-metrics');
      if (!response.ok) throw new Error('Ошибка при получении метрик лидов');
      return response.json();
    }
  );

/**
 * Получение взаимодействий с лидами
 */
export const getLeadInteractions = createApiMethod(
  async (leadId = null) => {
    // Если указан ID лида, фильтруем по нему
    const filteredInteractions = leadId 
      ? LEAD_INTERACTIONS.filter(interaction => interaction.lead_id === leadId) 
      : LEAD_INTERACTIONS;
    
    return mockResponse(filteredInteractions);
  },
  async (leadId = null) => {
    // Реальный API запрос
    const url = leadId 
      ? `/api/leads/${leadId}/interactions` 
      : '/api/leads/interactions';
      
    const response = await fetch(url);
    if (!response.ok) throw new Error('Ошибка при получении взаимодействий с лидами');
    return response.json();
  }
);

/**
 * Создание нового взаимодействия с лидом
 */
export const createLeadInteraction = createApiMethod(
  async (interactionData) => {
    // Генерируем новый ID для взаимодействия
    const newId = Math.max(...LEAD_INTERACTIONS.map(i => i.id)) + 1;
    
    // Создаем новое взаимодействие
    const newInteraction = {
      id: newId,
      created_by: interactionData.created_by || 1, // По умолчанию первый сотрудник
      date: interactionData.date || new Date().toISOString(),
      quality_score: interactionData.quality_score || 75,
      ai_feedback: null,
      ...interactionData
    };
    
    // Добавляем в локальное хранилище
    LEAD_INTERACTIONS.push(newInteraction);
    
    return mockResponse(newInteraction);
  },
  async (interactionData) => {
    // Реальный API запрос
    const response = await fetch('/api/leads/interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(interactionData)
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при создании взаимодействия с лидом');
    }
    
    return response.json();
  }
);

/**
 * Изменение настроек моков (для тестирования)
 */
export const setMockConfig = (configUpdate) => {
  Object.assign(CONFIG, configUpdate);
};

/**
 * Проверка, включены ли мок-данные
 */
export const isMockEnabled = () => CONFIG.MOCK_ENABLED;