// src/sections/sales/_mock/lead-history-mock.js

/**
 * Мок-данные для истории клиентов и лидов
 */

// Статусы клиентов
export const CLIENT_STATUSES = {
    NEW: 'Новый',
    REGULAR: 'Постоянный',
    PASSIVE: 'Пассивный',
    VIP: 'VIP'
  };
  
  // Мок история клиентов
  export const clientHistoryMock = [
    {
      id: 1001,
      name: 'ООО "Технопром"',
      status: CLIENT_STATUSES.REGULAR,
      firstContactDate: '2024-05-15',
      transactions: [
        { id: 1, date: '2024-06-10', amount: 125000, products: ['Базовая лицензия', 'Модуль аналитики'], isPaid: true },
        { id: 2, date: '2024-07-22', amount: 75000, products: ['Расширение лицензии'], isPaid: true },
        { id: 3, date: '2024-08-15', amount: 95000, products: ['Модуль интеграции', 'Техподдержка'], isPaid: false }
      ],
      averageCheck: 98333,
      totalRevenue: 295000,
      profit: 148000,
      profitMargin: 50.2,
      lastContact: '2024-08-18',
      nextContactScheduled: '2024-08-25',
      assignedTo: 12345,
      notes: 'Стабильный клиент, заинтересован в долгосрочном сотрудничестве'
    },
    {
      id: 1002,
      name: 'ИП Сергеев',
      status: CLIENT_STATUSES.NEW,
      firstContactDate: '2024-07-28',
      transactions: [
        { id: 4, date: '2024-08-05', amount: 45000, products: ['Стартовый пакет'], isPaid: true }
      ],
      averageCheck: 45000,
      totalRevenue: 45000,
      profit: 18000,
      profitMargin: 40,
      lastContact: '2024-08-10',
      nextContactScheduled: '2024-08-30',
      assignedTo: 12345,
      notes: 'Новый клиент, потенциал для продажи дополнительных модулей'
    },
    {
      id: 1003,
      name: 'АО "МегаСтрой"',
      status: CLIENT_STATUSES.VIP,
      firstContactDate: '2023-11-10',
      transactions: [
        { id: 5, date: '2023-12-01', amount: 350000, products: ['Корпоративная лицензия', 'Премиум поддержка'], isPaid: true },
        { id: 6, date: '2024-03-15', amount: 280000, products: ['Модуль планирования', 'Интеграция с 1С'], isPaid: true },
        { id: 7, date: '2024-06-20', amount: 420000, products: ['Расширенная аналитика', 'Консалтинг'], isPaid: true },
        { id: 8, date: '2024-08-01', amount: 320000, products: ['Модуль управления проектами', 'Обучение'], isPaid: false }
      ],
      averageCheck: 342500,
      totalRevenue: 1370000,
      profit: 685000,
      profitMargin: 50,
      lastContact: '2024-08-12',
      nextContactScheduled: '2024-08-22',
      assignedTo: 12345,
      notes: 'VIP-клиент, регулярные крупные заказы, высокий приоритет'
    },
    {
      id: 1004,
      name: 'ООО "СтарТрейд"',
      status: CLIENT_STATUSES.PASSIVE,
      firstContactDate: '2023-09-05',
      transactions: [
        { id: 9, date: '2023-10-10', amount: 120000, products: ['Базовая лицензия', 'Модуль отчетности'], isPaid: true },
        { id: 10, date: '2024-01-15', amount: 35000, products: ['Техподдержка'], isPaid: true }
      ],
      averageCheck: 77500,
      totalRevenue: 155000,
      profit: 62000,
      profitMargin: 40,
      lastContact: '2024-04-20',
      nextContactScheduled: '2024-08-25',
      assignedTo: 12345,
      notes: 'Пассивный клиент, давно не было крупных заказов, требуется активация'
    },
    {
      id: 1005,
      name: 'ЗАО "ИнноТех"',
      status: CLIENT_STATUSES.REGULAR,
      firstContactDate: '2024-02-10',
      transactions: [
        { id: 11, date: '2024-03-01', amount: 85000, products: ['Стартовый пакет', 'Консультация'], isPaid: true },
        { id: 12, date: '2024-05-12', amount: 110000, products: ['Модуль документооборота', 'Расширение лицензии'], isPaid: true },
        { id: 13, date: '2024-07-25', amount: 65000, products: ['Интеграционный модуль'], isPaid: false }
      ],
      averageCheck: 86667,
      totalRevenue: 260000,
      profit: 117000,
      profitMargin: 45,
      lastContact: '2024-08-02',
      nextContactScheduled: '2024-09-01',
      assignedTo: 12346,
      notes: 'Стабильно растущий клиент, интересуется новыми модулями'
    }
  ];
  
  // Мок история звонков с оценками ИИ
  export const callHistoryMock = [
    {
      id: 201,
      clientId: 1001,
      date: '2024-08-18T14:30:00',
      duration: 840, // в секундах (14 минут)
      recordingUrl: 'https://example.com/recordings/call-1001-201',
      employeeId: 12345,
      type: 'Исходящий',
      result: 'Успешный контакт',
      notes: 'Обсуждение текущего статуса заказа и возможных дополнительных услуг',
      aiAnalysis: {
        overallScore: 87,
        categories: {
          greeting: 90, // Приветствие
          needsIdentification: 85, // Выявление потребностей
          productPresentation: 80, // Презентация продукта
          objectionHandling: 85, // Работа с возражениями
          closing: 95 // Закрытие разговора
        },
        keyPhrases: [
          'Могу предложить вам специальные условия',
          'Давайте рассмотрим возможности интеграции'
        ],
        recommendations: [
          'Уделите больше внимания выявлению дополнительных потребностей',
          'Хорошая работа с закрытием сделки'
        ]
      }
    },
    {
      id: 202,
      clientId: 1002,
      date: '2024-08-10T11:15:00',
      duration: 420, // в секундах (7 минут)
      recordingUrl: 'https://example.com/recordings/call-1002-202',
      employeeId: 12345,
      type: 'Исходящий',
      result: 'Успешный контакт',
      notes: 'Знакомство с новым продуктом, ответы на вопросы клиента',
      aiAnalysis: {
        overallScore: 75,
        categories: {
          greeting: 85,
          needsIdentification: 70,
          productPresentation: 80,
          objectionHandling: 65,
          closing: 75
        },
        keyPhrases: [
          'Наш продукт решает именно эту задачу',
          'Мы можем провести демонстрацию'
        ],
        recommendations: [
          'Улучшите работу с возражениями',
          'Задавайте больше открытых вопросов'
        ]
      }
    },
    {
      id: 203,
      clientId: 1003,
      date: '2024-08-12T16:00:00',
      duration: 1260, // в секундах (21 минута)
      recordingUrl: 'https://example.com/recordings/call-1003-203',
      employeeId: 12345,
      type: 'Исходящий',
      result: 'Успешный контакт',
      notes: 'Детальное обсуждение нового модуля и возможностей интеграции',
      aiAnalysis: {
        overallScore: 92,
        categories: {
          greeting: 95,
          needsIdentification: 90,
          productPresentation: 95,
          objectionHandling: 90,
          closing: 90
        },
        keyPhrases: [
          'Этот модуль значительно ускорит ваши бизнес-процессы',
          'Мы можем настроить систему под ваши конкретные нужды'
        ],
        recommendations: [
          'Отличная работа с VIP-клиентом',
          'Высокий уровень профессионализма'
        ]
      }
    },
    {
      id: 204,
      clientId: 1005,
      date: '2024-08-02T10:30:00',
      duration: 600, // в секундах (10 минут)
      recordingUrl: 'https://example.com/recordings/call-1005-204',
      employeeId: 12345,
      type: 'Исходящий',
      result: 'Успешный контакт',
      notes: 'Подтверждение получения заказа и обсуждение сроков внедрения',
      aiAnalysis: {
        overallScore: 82,
        categories: {
          greeting: 85,
          needsIdentification: 80,
          productPresentation: 75,
          objectionHandling: 85,
          closing: 85
        },
        keyPhrases: [
          'Внедрение занимает около двух недель',
          'Мы предоставим полную техподдержку'
        ],
        recommendations: [
          'Больше внимания деталям продукта',
          'Хорошая работа с клиентом'
        ]
      }
    },
    {
      id: 205,
      clientId: 1004,
      date: '2024-04-20T14:00:00',
      duration: 360, // в секундах (6 минут)
      recordingUrl: 'https://example.com/recordings/call-1004-205',
      employeeId: 12345,
      type: 'Исходящий',
      result: 'Успешный контакт',
      notes: 'Попытка активации клиента, обсуждение новых возможностей системы',
      aiAnalysis: {
        overallScore: 68,
        categories: {
          greeting: 75,
          needsIdentification: 65,
          productPresentation: 70,
          objectionHandling: 60,
          closing: 70
        },
        keyPhrases: [
          'У нас появились новые модули',
          'Можем предложить специальные условия'
        ],
        recommendations: [
          'Улучшите выявление потребностей',
          'Работайте над преодолением возражений',
          'Не хватает конкретики в предложениях'
        ]
      }
    }
  ];
  
  // Мок планы продаж для сотрудника
  export const salesPlansMock = {
    daily: {
      date: '2024-08-20',
      callsTarget: 20,
      callsMade: 15,
      meetingsTarget: 2,
      meetingsHeld: 1,
      salesTarget: 150000,
      salesActual: 120000,
      leadsToProcessTarget: 10,
      leadsProcessed: 8
    },
    weekly: {
      weekNumber: 34, // Неделя 34, 2024
      startDate: '2024-08-19',
      endDate: '2024-08-25',
      callsTarget: 100,
      callsMade: 45,
      meetingsTarget: 10,
      meetingsHeld: 4,
      salesTarget: 750000,
      salesActual: 320000,
      leadsToProcessTarget: 50,
      leadsProcessed: 22,
      conversionTarget: 20,
      actualConversion: 18.2
    },
    monthly: {
      month: 'Август 2024',
      callsTarget: 400,
      callsMade: 250,
      meetingsTarget: 40,
      meetingsHeld: 28,
      salesTarget: 3000000,
      salesActual: 2150000,
      leadsToProcessTarget: 200,
      leadsProcessed: 140,
      conversionTarget: 20,
      actualConversion: 19.5,
      bonusTarget: 150000,
      bonusActual: 107500
    }
  };
  
  // Функция для получения мок-данных истории клиентов
  export const fetchClientHistoryMock = (delay = 500) => 
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(clientHistoryMock);
      }, delay);
    });
  
  // Функция для получения мок-данных истории звонков
  export const fetchCallHistoryMock = (delay = 500) => 
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(callHistoryMock);
      }, delay);
    });
  
  // Функция для получения мок-данных планов продаж
  export const fetchSalesPlansMock = (delay = 500) => 
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(salesPlansMock);
      }, delay);
    });