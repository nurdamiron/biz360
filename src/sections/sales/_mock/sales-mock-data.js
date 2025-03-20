// src/sections/sales/_mock/sales-mock-data.js

// Флаг для определения, использовать ли мок-данные
// В продакшене или при наличии API установите в false
export const ENABLE_MOCK_DATA = true;

// Функция для проверки необходимости использования мок-данных
export const shouldUseMockData = () => 
  ENABLE_MOCK_DATA && process.env.NODE_ENV !== 'production';

// Данные сотрудника
export const mockEmployee = {
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

// Данные метрик
export const mockMetrics = {
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

// Данные активных клиентов
export const mockActiveClients = [
  { id: 1, name: 'ООО "Технопром"', status: 'Переговоры', potential_amount: 450000, probability: 65, urgency: 'Высокая' },
  { id: 2, name: 'ИП Иванов', status: 'Первичный контакт', potential_amount: 120000, probability: 25, urgency: 'Средняя' },
  { id: 3, name: 'АО "СтройИнвест"', status: 'Согласование КП', potential_amount: 780000, probability: 40, urgency: 'Низкая' },
  { id: 4, name: 'ООО "ФинТрейд"', status: 'Новый клиент', potential_amount: 520000, probability: 20, urgency: 'Высокая' }
];

// Данные завершенных сделок
export const mockCompletedDeals = [
  { id: 1, client: 'ООО "ТехноЛаб"', close_date: '12.03.2025', amount: 350000, days: 18, bonus: 24500, rating: 4 },
  { id: 2, client: 'ИП Петров', close_date: '05.03.2025', amount: 85000, days: 7, bonus: 5950, rating: 3 },
  { id: 3, client: 'ЗАО "МегаТех"', close_date: '25.01.2025', amount: 750000, days: 22, bonus: 52500, rating: 5 }
];

// Данные новых назначений
export const mockNewAssignments = [
  { 
    id: 1, 
    name: 'ООО "ФинТрейд"', 
    potential_amount: 520000, 
    priority: 'Высокий', 
    potential_bonus: 36400, 
    contact_deadline: '18.03.2025'
  }
];

// Данные по продажам
export const mockSalesPerformance = {
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

// Данные для рекомендаций по улучшению
export const mockImprovements = [
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

// Данные по сегментам продаж
export const mockSalesSegments = {
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

// Данные графика для метрик
export const mockChartData = [
  { date: '1 Мар', performance: 75, kpi: 72, quality: 82, work_volume: 68, speed: 71, plan_completion: 70 },
  { date: '8 Мар', performance: 80, kpi: 77, quality: 87, work_volume: 72, speed: 76, plan_completion: 75 },
  { date: '15 Мар', performance: 76, kpi: 73, quality: 83, work_volume: 68, speed: 72, plan_completion: 71 },
  { date: '22 Мар', performance: 74, kpi: 71, quality: 81, work_volume: 66, speed: 70, plan_completion: 69 },
  { date: '29 Мар', performance: 77, kpi: 74, quality: 84, work_volume: 69, speed: 73, plan_completion: 72 }
];

// Функция для генерации мок-данных с задержкой для имитации API запроса
export const fetchMockData = async (dataKey, delay = 500) => new Promise((resolve) => {
    setTimeout(() => {
      switch (dataKey) {
        case 'employee':
          resolve(mockEmployee);
          break;
        case 'metrics':
          resolve(mockMetrics);
          break;
        case 'activeClients':
          resolve(mockActiveClients);
          break;
        case 'completedDeals':
          resolve(mockCompletedDeals);
          break;
        case 'newAssignments':
          resolve(mockNewAssignments);
          break;
        case 'salesPerformance':
          resolve(mockSalesPerformance);
          break;
        case 'improvements':
          resolve(mockImprovements);
          break;
        case 'salesSegments':
          resolve(mockSalesSegments);
          break;
        case 'chartData':
          resolve(mockChartData);
          break;
        default:
          resolve(null);
      }
    }, delay);
  });