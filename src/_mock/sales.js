// src/_mock/sales.js
import { getMockData, shouldUseMockData } from '../utils/mock-data-utils';

/**
 * Мок-данные для сотрудника
 */
export const employeeMockData = {
  id: '12345',
  name: "Иван Петров",
  department: "sales",
  role: "manager",
  level: "Middle",
  progress_to_next_level: 68,
  next_level: "Senior",
  competencies: {
    product_knowledge: 82,
    sales_skills: 78,
    objection_handling: 75,
    documentation: 90
  },
  development_plan: {
    required_courses: [
      { id: 1, title: "Продвинутые техники работы с возражениями", duration: 2, completed: false },
      { id: 2, title: "Ускорение цикла сделки", duration: 1.5, completed: false },
      { id: 3, title: "Кросс-продажи и допродажи", duration: 2, completed: false }
    ],
    completed_courses: 5,
    total_courses: 12
  }
};

/**
 * Мок-данные метрик
 */
export const metricsMockData = {
  overall_performance: 70,
  overall_performance_trend: 5,
  kpi: 69,
  kpi_trend: 3,
  work_volume: 65,
  work_volume_trend: 2,
  quality: 79,
  quality_trend: -1,
  speed: 63,
  speed_trend: 0,
  plan_completion: 73,
  plan_completion_trend: 3,
  bonuses: {
    summary: {
      total_confirmed: 45000,
      total_potential: 78000,
      confirmation_rate: 58
    },
    list: [
      { id: 1, client: 'ООО "Технопром"', status: 'В процессе', amount: 31500, probability: 65 },
      { id: 2, client: 'ИП Иванов', status: 'Первый контакт', amount: 8400, probability: 25 },
      { id: 3, client: 'АО "СтройИнвест"', status: 'Согласование', amount: 46800, probability: 40 }
    ]
  }
};

/**
 * Мок-данные активных клиентов
 */
export const activeClientsMockData = [
  { id: 1, name: 'ООО "Технопром"', status: 'Переговоры', potential_amount: 450000, probability: 65, urgency: 'Высокая' },
  { id: 2, name: 'ИП Иванов', status: 'Первичный контакт', potential_amount: 120000, probability: 25, urgency: 'Средняя' },
  { id: 3, name: 'АО "СтройИнвест"', status: 'Согласование КП', potential_amount: 780000, probability: 40, urgency: 'Низкая' },
  { id: 4, name: 'ООО "ФинТрейд"', status: 'Новый клиент', potential_amount: 520000, probability: 20, urgency: 'Высокая' }
];

/**
 * Мок-данные завершенных сделок
 */
export const completedDealsMockData = [
  { id: 1, client: 'ООО "ТехноЛаб"', close_date: '12.03.2025', amount: 350000, days: 18, bonus: 24500, rating: 4 },
  { id: 2, client: 'ИП Петров', close_date: '05.03.2025', amount: 85000, days: 7, bonus: 5950, rating: 3 },
  { id: 3, client: 'ЗАО "МегаТех"', close_date: '25.01.2025', amount: 750000, days: 22, bonus: 52500, rating: 5 }
];

/**
 * Мок-данные новых назначений
 */
export const newAssignmentsMockData = [
  { 
    id: 1, 
    name: 'ООО "ФинТрейд"', 
    potential_amount: 520000, 
    priority: 'Высокий', 
    potential_bonus: 36400, 
    contact_deadline: '18.03.2025'
  }
];

/**
 * Мок-данные по продажам
 */
export const salesPerformanceMockData = {
  currentMonth: 'Март 2025',
  plan: 500000,
  actual: 365000,
  conversion: 22,
  contacts: 45,
  closed: 10,
  averageCheck: 142500,
  departmentAverage: 127000,
  rank: {
    position: 4,
    total: 12,
    topPerformers: [
      { id: 105, name: 'Сотрудник #105', kpi: 89 },
      { id: 217, name: 'Сотрудник #217', kpi: 85 },
      { id: 142, name: 'Сотрудник #142', kpi: 82 }
    ]
  }
};

/**
 * Мок-данные для рекомендаций по улучшению
 */
export const improvementsMockData = [
  {
    title: 'Увеличить скорость обработки лидов',
    current: 63,
    target: '75-80%',
    description: 'Это поможет вам быстрее обрабатывать поступающие заявки и увеличить конверсию'
  },
  {
    title: 'Повысить конверсию переговоров в сделки',
    current: 22,
    target: '25%',
    description: 'Фокусируйтесь на работе с возражениями и более качественной проработке потребностей клиента'
  },
  {
    title: 'Увеличить количество активных клиентов',
    current: 7,
    target: '9-10',
    description: 'Оптимальная загрузка поможет вам максимизировать эффективность и выполнить план'
  }
];

/**
 * Мок-данные графика для метрик
 */
export const chartDataMockData = [
  { date: '1 Мар', performance: 75, kpi: 72, quality: 82, work_volume: 68, speed: 71, plan_completion: 70 },
  { date: '8 Мар', performance: 80, kpi: 77, quality: 87, work_volume: 72, speed: 76, plan_completion: 75 },
  { date: '15 Мар', performance: 76, kpi: 73, quality: 83, work_volume: 68, speed: 72, plan_completion: 71 },
  { date: '22 Мар', performance: 74, kpi: 71, quality: 81, work_volume: 66, speed: 70, plan_completion: 69 },
  { date: '29 Мар', performance: 77, kpi: 74, quality: 84, work_volume: 69, speed: 73, plan_completion: 72 }
];

/**
 * Мок-данные по сегментам продаж
 */
export const salesSegmentsMockData = {
  industries: [
    { name: 'IT-компании', conversion: 32, averageCheck: 155000 },
    { name: 'Строительство', conversion: 24, averageCheck: 175000 },
    { name: 'Розничная торговля', conversion: 18, averageCheck: 110000 }
  ],
  businessSize: [
    { name: 'Малый бизнес', conversion: 20, averageCheck: 85000 },
    { name: 'Средний бизнес', conversion: 28, averageCheck: 185000 },
    { name: 'Крупный бизнес', conversion: 15, averageCheck: 410000 }
  ],
  source: [
    { name: 'Рекомендации', conversion: 40, averageCheck: 160000 },
    { name: 'Веб-сайт', conversion: 18, averageCheck: 120000 },
    { name: 'Прямые продажи', conversion: 22, averageCheck: 170000 }
  ]
};

// Объединенный объект со всеми мок-данными
const allMockData = {
  employee: employeeMockData,
  metrics: metricsMockData,
  activeClients: activeClientsMockData,
  completedDeals: completedDealsMockData,
  newAssignments: newAssignmentsMockData,
  salesPerformance: salesPerformanceMockData,
  improvements: improvementsMockData,
  chartData: chartDataMockData,
  salesSegments: salesSegmentsMockData
};

/**
 * Функция для получения мок-данных с имитацией API-запроса
 * @param {string} dataKey - Ключ запрашиваемых данных
 * @param {number} delay - Задержка в мс
 * @returns {Promise<any>} Промис с данными
 */
export const fetchMockData = async (dataKey, delay = 500) => {
  console.log('fetchMockData: запрос мок-данных', { dataKey, delay });
  
  return getMockData(allMockData, dataKey, delay);
};

const mockApiCall = async (data, delay) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return data;
  };
  
/**
 * Функция для получения всех мок-данных для дашборда
 * @param {number} delay - Задержка в мс
 * @returns {Promise<Object>} Промис с объектом данных
 */
export const fetchAllMockData = async (delay = 500) => {
  console.log('fetchAllMockData: запрос всех мок-данных для дашборда');
  
  return mockApiCall(allMockData, delay);
};