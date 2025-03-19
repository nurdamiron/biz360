// src/utils/mockData.js
import { format, subDays, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Вспомогательная функция для генерации случайного числа в заданном диапазоне
 */
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Получение случайного значения KPI с учетом тренда
 */
const getRandomKpi = (baseLine = 70, variance = 15, trend = 0) => {
  const value = baseLine + trend + getRandomNumber(-variance, variance);
  return Math.min(Math.max(value, 0), 100); // Ограничиваем значение от 0 до 100
};

/**
 * Генерация мок-данных для сотрудников
 */
export const generateEmployeesMockData = (count = 10) => {
  const departments = ['sales', 'logistics', 'accounting', 'manufacture'];
  const roles = ['head', 'manager', 'employee'];
  const firstNames = ['Иван', 'Алексей', 'Михаил', 'Дмитрий', 'Сергей', 'Андрей', 'Екатерина', 'Ольга', 'Мария', 'Анна'];
  const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Соколов', 'Михайлов', 'Новиков', 'Волков'];

  // Генерация случайного сотрудника
  const generateEmployee = (id) => {
    const department = departments[getRandomNumber(0, departments.length - 1)];
    const role = roles[getRandomNumber(0, roles.length - 1)];
    const firstName = firstNames[getRandomNumber(0, firstNames.length - 1)];
    const lastName = lastNames[getRandomNumber(0, lastNames.length - 1)];
    
    const kpi = getRandomKpi();
    const workVolume = getRandomKpi(kpi - 10, 10);
    const quality = getRandomKpi(kpi - 5, 15);
    const activity = getRandomKpi(kpi - 10, 20);
    const speed = getRandomKpi(kpi - 15, 15);
    const planCompletion = getRandomKpi(kpi - 5, 10);
    
    // Финансовые метрики
    const financial = {
      revenue: getRandomNumber(500000, 5000000),
      revenue_target: getRandomNumber(1000000, 6000000),
      margin: getRandomKpi(60, 20),
      margin_target: 70,
      growth: getRandomNumber(-10, 30),
      growth_target: 10
    };
    
    // Операционные метрики
    const operational = {
      timeliness: getRandomKpi(),
      completion: getRandomKpi(),
      efficiency: getRandomKpi()
    };
    
    return {
      id,
      name: `${lastName} ${firstName}`,
      department,
      role,
      metrics: {
        kpi,
        overall_performance: Math.round((kpi + workVolume + quality + activity) / 4),
        work_volume: workVolume,
        quality,
        activity,
        speed,
        plan_completion: planCompletion,
        financial: Math.round((financial.margin / financial.margin_target) * 100),
        operational: Math.round((operational.timeliness + operational.completion + operational.efficiency) / 3)
      },
      financial,
      operational
    };
  };

  return Array.from({ length: count }, (_, i) => generateEmployee(i + 1));
};

/**
 * Генерация данных по истории изменения метрик
 */
export const generatePerformanceHistory = (months = 6, baseKpi = 65, trend = 5) => 
  Array.from({ length: months }, (_, i) => {
    // Увеличиваем тренд с каждым месяцем (чем ближе к текущему месяцу)
    const monthTrend = (trend / months) * (i + 1);
    const month = format(subMonths(new Date(), months - 1 - i), 'MMMM', { locale: ru });
    
    return {
      month,
      performance: getRandomKpi(baseKpi + monthTrend, 5),
      kpi: getRandomKpi(baseKpi + monthTrend, 8),
      quality: getRandomKpi(baseKpi + monthTrend, 10),
      work_volume: getRandomKpi(baseKpi + monthTrend - 5, 10),
      activity: getRandomKpi(baseKpi + monthTrend - 8, 15),
      speed: getRandomKpi(baseKpi + monthTrend, 10),
      financial: getRandomKpi(baseKpi + monthTrend - 3, 12),
      operational: getRandomKpi(baseKpi + monthTrend + 2, 8),
      plan_completion: getRandomKpi(baseKpi + monthTrend, 5)
    };
  });

/**
 * Генерация истории метрик сотрудника за последние дни
 */
export const generateEmployeeHistory = (days = 30, baseKpi = 70, trend = 10) => 
  Array.from({ length: days }, (_, i) => {
    // Увеличиваем тренд с каждым днем (чем ближе к текущему дню)
    const dayTrend = (trend / days) * i;
    const date = format(subDays(new Date(), days - 1 - i), 'yyyy-MM-dd');
    
    return {
      date,
      kpi: getRandomKpi(baseKpi + dayTrend, 5),
      overall_performance: getRandomKpi(baseKpi + dayTrend, 5),
      work_volume: getRandomKpi(baseKpi + dayTrend - 5, 8),
      quality: getRandomKpi(baseKpi + dayTrend + 3, 7),
      activity: getRandomKpi(baseKpi + dayTrend - 8, 10),
      speed: getRandomKpi(baseKpi + dayTrend, 8),
      plan_completion: getRandomKpi(baseKpi + dayTrend + 1, 6)
    };
  });

/**
 * Генерация мок-данных для бонусов сотрудника
 */
export const generateEmployeeBonuses = () => {
  const totalPotential = getRandomNumber(50000, 300000);
  const confirmationRate = getRandomKpi(70, 25);
  const totalConfirmed = Math.round(totalPotential * (confirmationRate / 100));
  
  return {
    summary: {
      total_potential: totalPotential,
      total_confirmed: totalConfirmed,
      confirmation_rate: confirmationRate
    },
    items: Array.from({ length: getRandomNumber(3, 8) }, (_, i) => ({
      id: i + 1,
      description: `Бонус за заказ #${getRandomNumber(10000, 99999)}`,
      amount: getRandomNumber(5000, 50000),
      confirmed: Math.random() > 0.3,
      date: format(subDays(new Date(), getRandomNumber(1, 60)), 'yyyy-MM-dd')
    }))
  };
};

/**
 * Генерация данных для специфичных метрик отдела
 */
export const generateDepartmentSpecificMetrics = (department) => {
  switch (department) {
    case 'sales':
      return {
        sales: {
          revenue: getRandomNumber(1000000, 5000000),
          revenue_target: 5000000,
          deals_count: getRandomNumber(30, 120),
          deals_target: 100,
          conversion_rate: getRandomKpi(60, 30),
          conversion_target: 70
        }
      };
    case 'accounting':
      return {
        accounting: {
          documents_processed: getRandomNumber(500, 2000),
          documents_target: 2000,
          accuracy: getRandomKpi(85, 15)
        }
      };
    case 'logistics':
      return {
        logistics: {
          delivery_timeliness: getRandomKpi(75, 20),
          route_efficiency: getRandomKpi(65, 25)
        }
      };
    case 'manufacture':
      return {
        manufacture: {
          units_produced: getRandomNumber(500, 2000),
          production_efficiency: getRandomKpi(70, 20),
          quality_rate: getRandomKpi(85, 10)
        }
      };
    default:
      return {};
  }
};

/**
 * Полная генерация данных для метрик сотрудника
 */
export const generateEmployeeFullMetrics = (employeeId = 1, useMockData = true) => {
  if (!useMockData) {
    return null; // В реальном приложении здесь будет запрос к API
  }
  
  const departments = ['sales', 'logistics', 'accounting', 'manufacture'];
  const roles = ['head', 'manager', 'employee'];
  const firstNames = ['Иван', 'Алексей', 'Михаил', 'Дмитрий', 'Сергей', 'Андрей', 'Екатерина', 'Ольга', 'Мария', 'Анна'];
  const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Соколов', 'Михайлов', 'Новиков', 'Волков'];
  
  const department = departments[getRandomNumber(0, departments.length - 1)];
  const role = roles[getRandomNumber(0, roles.length - 1)];
  const firstName = firstNames[getRandomNumber(0, firstNames.length - 1)];
  const lastName = lastNames[getRandomNumber(0, lastNames.length - 1)];
  
  const baseKpi = getRandomKpi(70, 15);
  
  const employeeMetrics = {
    kpi: baseKpi,
    overall_performance: getRandomKpi(baseKpi, 5),
    work_volume: getRandomKpi(baseKpi - 5, 10),
    quality: getRandomKpi(baseKpi + 5, 7),
    activity: getRandomKpi(baseKpi - 8, 12),
    speed: getRandomKpi(baseKpi, 10),
    plan_completion: getRandomKpi(baseKpi, 8),
    specific_metrics: generateDepartmentSpecificMetrics(department)
  };
  
  // Данные для сравнения со средним по отделу
  const departmentComparison = {
    overall_performance: getRandomKpi(70, 10),
    kpi: getRandomKpi(70, 10),
    work_volume: getRandomKpi(65, 15),
    quality: getRandomKpi(75, 10)
  };
  
  return {
    success: true,
    employee: {
      id: employeeId,
      name: `${lastName} ${firstName}`,
      department,
      role
    },
    metrics: employeeMetrics,
    bonuses: generateEmployeeBonuses(),
    history: generateEmployeeHistory(),
    department_comparison: departmentComparison
  };
};

/**
 * Функция для проверки использования мок-данных
 * @param {boolean} useMockData - Флаг использования мок-данных
 * @returns {boolean} - Возвращает переданный флаг или true по умолчанию
 */
export const shouldUseMockData = (useMockData = true) => 
  // Здесь можно добавить логику для определения режима работы
  // Например, проверку переменных окружения, наличие API и т.д.
  useMockData;

// Экспорт функции для переключения режима мок-данных
export const useMockData = () => ({
  // Функция, которая возвращает данные в зависимости от режима
  getData: (mockDataFunc, apiFunc, useMock = true) => {
    if (shouldUseMockData(useMock)) {
      return Promise.resolve(typeof mockDataFunc === 'function' ? mockDataFunc() : mockDataFunc);
    } else {
      return apiFunc();
    }
  }
});

export default {
  shouldUseMockData,
  useMockData,
  generateEmployeesMockData,
  generatePerformanceHistory,
  generateEmployeeHistory,
  generateEmployeeBonuses,
  generateDepartmentSpecificMetrics,
  generateEmployeeFullMetrics
};