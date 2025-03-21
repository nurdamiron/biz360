// src/sections/sales/components/lead-distribution/smartLeadDistributionService.js
import { shouldUseMockData, mockApiCall } from '../../../../utils/mock-data-utils';
import { leadDistributionService } from './leadDistributionService';

/**
 * Класс для интеллектуального распределения лидов с учетом множества факторов
 * Расширяет базовый сервис распределения лидов
 */
class SmartLeadDistributionService {
  constructor() {
    this._leadDistributionService = leadDistributionService;
    this._employees = [];
    this._leads = [];
    this._clientHistory = [];
    this._employeeSpecializations = {};
    this._employeePerformanceMetrics = {};
    this._isLoading = false;
    this._error = null;
  }

  /**
   * Инициализация сервиса и загрузка необходимых данных
   */
  async initialize() {
    try {
      this._isLoading = true;
      this._error = null;
      
      // Загружаем сотрудников и лидов из базового сервиса
      this._employees = await this._leadDistributionService.fetchEmployees(true);
      this._leads = await this._leadDistributionService.fetchLeads(true);
      
      // Загружаем дополнительные данные
      await this._loadClientHistory();
      await this._loadEmployeeSpecializations();
      await this._loadEmployeePerformanceMetrics();
      
      this._isLoading = false;
      return true;
    } catch (error) {
      this._isLoading = false;
      this._error = error.message || 'Ошибка при инициализации сервиса';
      console.error('Error initializing smart service:', error);
      throw new Error(this._error);
    }
  }

  /**
   * Загрузка истории взаимодействия с клиентами
   * @private
   */
  async _loadClientHistory() {
    if (shouldUseMockData()) {
      // Имитация загрузки истории клиентов
      this._clientHistory = await this._getMockClientHistory();
    } else {
      // Реальный API запрос для получения истории клиентов
      const response = await fetch('/api/sales/client-history');
      this._clientHistory = await response.json();
    }
  }

  /**
   * Загрузка специализаций сотрудников
   * @private
   */
  async _loadEmployeeSpecializations() {
    if (shouldUseMockData()) {
      // Имитация загрузки специализаций
      this._employeeSpecializations = await this._getMockEmployeeSpecializations();
    } else {
      // Реальный API запрос для получения специализаций
      const response = await fetch('/api/sales/employee-specializations');
      this._employeeSpecializations = await response.json();
    }
  }

  /**
   * Загрузка метрик производительности сотрудников
   * @private
   */
  async _loadEmployeePerformanceMetrics() {
    if (shouldUseMockData()) {
      // Имитация загрузки метрик
      this._employeePerformanceMetrics = await this._getMockEmployeePerformanceMetrics();
    } else {
      // Реальный API запрос для получения метрик
      const response = await fetch('/api/sales/employee-metrics');
      this._employeePerformanceMetrics = await response.json();
    }
  }

  /**
   * Интеллектуальное распределение лидов с учетом множества факторов
   * @param {Object} options - Опции распределения
   * @returns {Promise<Array>} - Обновленный массив лидов
   */
  async smartAssignLeads(options = {}) {
    try {
      this._isLoading = true;
      this._error = null;

      const {
        priorityFirst = true,
        balanceLoad = true,
        considerExperience = true,
        considerSpecialization = true,
        preserveHistory = true,
        considerPerformance = true,
        maxLeadsPerEmployee = null,
      } = options;

      // Инициализация сервиса, если это еще не сделано
      if (this._employees.length === 0 || this._leads.length === 0) {
        await this.initialize();
      }

      // Получение нераспределенных лидов
      const unassignedLeads = this._leads.filter(lead => !lead.assigned_to);
      
      if (unassignedLeads.length === 0) {
        this._isLoading = false;
        return this._leads;
      }

      // Получение доступных сотрудников
      const availableEmployees = this._employees.filter(emp => emp.active !== false);
      
      if (availableEmployees.length === 0) {
        this._isLoading = false;
        throw new Error('Нет доступных сотрудников для распределения');
      }

      // Запрос к API или обновление мок-данных
      if (shouldUseMockData()) {
        // Имитация задержки API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Расширенная логика распределения для мок-данных
        const updatedLeads = await this._smartAssignLeadsMock(
          unassignedLeads, 
          availableEmployees, 
          options
        );
        
        // Обновление локальных данных
        updatedLeads.forEach(updatedLead => {
          const index = this._leads.findIndex(lead => lead.id === updatedLead.id);
          if (index !== -1) {
            this._leads[index] = updatedLead;
          }
        });

        // Обновляем данные в базовом сервисе
        this._leadDistributionService._leads = this._leads;
      } else {
        // Реальный API запрос
        const response = await fetch('/api/sales/leads/smart-assign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(options),
        });
        
        const data = await response.json();
        this._leads = data;
        
        // Обновляем данные в базовом сервисе
        this._leadDistributionService._leads = this._leads;
      }

      this._isLoading = false;
      return this._leads;
    } catch (error) {
      this._isLoading = false;
      this._error = error.message || 'Ошибка при интеллектуальном распределении';
      console.error('Error smart-assigning leads:', error);
      throw new Error(this._error);
    }
  }

  /**
   * Поиск наиболее подходящего сотрудника для конкретного лида
   * @param {Object} lead - Данные лида
   * @param {Array} availableEmployees - Массив доступных сотрудников
   * @param {Object} options - Опции распределения
   * @returns {Object|null} - Наиболее подходящий сотрудник или null
   */
  findBestEmployeeMatch(lead, availableEmployees, options) {
    const {
      considerExperience = true,
      considerSpecialization = true,
      preserveHistory = true,
      considerPerformance = true
    } = options;
    
    // Копируем сотрудников чтобы не менять исходный массив
    let employees = [...availableEmployees];
    
    // Считаем очки для каждого сотрудника
    const employeeScores = employees.map(employee => {
      let score = 0;
      
      // 1. Проверяем историю взаимодействия с клиентом
      if (preserveHistory) {
        const hasHistory = this._clientHistory.some(
          history => history.clientId === lead.client_id && history.employeeId === employee.id
        );
        
        if (hasHistory) {
          score += 100; // Большой бонус за историю взаимодействия
        }
      }
      
      // 2. Проверяем соответствие опыта
      if (considerExperience) {
        // VIP клиенты должны назначаться опытным сотрудникам
        if (lead.priority === 'Высокий' && employee.level === 'Senior') {
          score += 30;
        } else if (lead.priority === 'Средний' && employee.level === 'Middle') {
          score += 20;
        } else if (lead.priority === 'Низкий' && employee.level === 'Junior') {
          score += 10;
        }
        
        // Бонус за высокий потенциальный чек и опыт сотрудника
        if (lead.potential_amount > 500000 && ['Senior', 'Team Lead'].includes(employee.level)) {
          score += 25;
        }
      }
      
      // 3. Проверяем соответствие специализации
      if (considerSpecialization && this._employeeSpecializations[employee.id]) {
        const specializations = this._employeeSpecializations[employee.id];
        
        // Проверяем соответствие отрасли клиента
        if (lead.industry && specializations.industries.includes(lead.industry)) {
          score += 20;
        }
        
        // Проверяем соответствие размера бизнеса
        if (lead.business_size && specializations.businessSizes.includes(lead.business_size)) {
          score += 15;
        }
        
        // Проверяем соответствие источника лида
        if (lead.source && specializations.leadSources.includes(lead.source)) {
          score += 10;
        }
      }
      
      // 4. Учитываем метрики производительности
      if (considerPerformance && this._employeePerformanceMetrics[employee.id]) {
        const metrics = this._employeePerformanceMetrics[employee.id];
        
        // Учитываем KPI
        score += metrics.kpi * 0.2;
        
        // Учитываем конверсию
        score += metrics.conversion * 0.3;
        
        // Учитываем скорость закрытия
        const speedBonus = (100 - metrics.averageClosingDays) * 0.05;
        score += speedBonus > 0 ? speedBonus : 0;
      }
      
      // 5. Учитываем текущую нагрузку
      const currentLoad = this._leads.filter(l => l.assigned_to === employee.id).length;
      const capacityPercent = currentLoad / (employee.capacity || 10);
      
      // Уменьшаем счет, если сотрудник уже сильно загружен
      if (capacityPercent > 0.9) {
        score -= 40;
      } else if (capacityPercent > 0.7) {
        score -= 20;
      } else if (capacityPercent > 0.5) {
        score -= 10;
      } else if (capacityPercent < 0.3) {
        score += 10; // Бонус за низкую загрузку
      }
      
      return {
        employee,
        score,
        currentLoad
      };
    });
    
    // Сортируем по оценке (от высокой к низкой)
    employeeScores.sort((a, b) => b.score - a.score);
    
    // Возвращаем лучшего сотрудника
    return employeeScores.length > 0 ? employeeScores[0].employee : null;
  }

  /**
   * Получить и рассчитать статистику сотрудников для интеллектуального распределения
   * @returns {Promise<Array>} - Расширенная статистика по сотрудникам
   */
  async getEmployeeStats() {
    try {
      // Получаем базовую статистику
      const baseStats = await this._leadDistributionService.getDistributionStats();
      
      // Расширяем статистику дополнительными данными
      const enhancedStats = {
        ...baseStats,
        employeeDetails: await Promise.all(
          baseStats.byEmployee.map(async (employee) => {
            // Получаем историю клиентов для этого сотрудника
            const clientHistory = this._clientHistory.filter(h => h.employeeId === employee.id);
            
            // Получаем метрики производительности
            const metrics = this._employeePerformanceMetrics[employee.id] || {};
            
            // Получаем специализации
            const specializations = this._employeeSpecializations[employee.id] || {};
            
            // Расширяем статистику
            return {
              ...employee,
              clientsCount: clientHistory.length,
              returnClientRate: metrics.returnClientRate || 0,
              avgDealValue: metrics.averageDealValue || 0,
              conversionRate: metrics.conversion || 0,
              specializations: specializations.industries || [],
              leadAssignmentScore: this._calculateAssignmentScore(employee.id)
            };
          })
        )
      };
      
      return enhancedStats;
    } catch (error) {
      console.error('Error getting enhanced employee stats:', error);
      throw new Error('Ошибка при получении расширенной статистики сотрудников');
    }
  }

  /**
   * Рассчитать оценку для назначения лидов сотруднику
   * @param {number} employeeId - ID сотрудника
   * @returns {number} - Оценка от 0 до 100
   * @private
   */
  _calculateAssignmentScore(employeeId) {
    // Находим сотрудника
    const employee = this._employees.find(e => e.id === employeeId);
    if (!employee) return 0;
    
    // Получаем метрики
    const metrics = this._employeePerformanceMetrics[employeeId] || {};
    
    // Базовый балл зависит от уровня сотрудника
    let score = employee.level === 'Senior' ? 80 : 
               employee.level === 'Middle' ? 60 : 
               employee.level === 'Junior' ? 40 : 20;
    
    // Корректируем в зависимости от KPI
    if (metrics.kpi) {
      score += (metrics.kpi - 50) * 0.2; // Бонус или штраф в зависимости от KPI
    }
    
    // Корректируем в зависимости от конверсии
    if (metrics.conversion) {
      score += (metrics.conversion - 20) * 0.5; // Бонус или штраф в зависимости от конверсии
    }
    
    // Корректируем в зависимости от нагрузки
    const currentLoad = this._leads.filter(l => l.assigned_to === employeeId).length;
    const capacity = employee.capacity || 10;
    const loadFactor = 1 - (currentLoad / capacity);
    score += loadFactor * 10; // Максимальный бонус 10 при нулевой загрузке
    
    // Ограничиваем оценку диапазоном 0-100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Логика интеллектуального распределения лидов для мок-данных
   * @param {Array} unassignedLeads - Нераспределенные лиды
   * @param {Array} availableEmployees - Доступные сотрудники
   * @param {Object} options - Опции распределения
   * @returns {Promise<Array>} - Обновленные лиды
   * @private
   */
  async _smartAssignLeadsMock(unassignedLeads, availableEmployees, options) {
    const {
      priorityFirst = true,
      maxLeadsPerEmployee = null
    } = options;

    // Сортировка лидов по приоритету (если включена опция)
    let leadsToAssign = [...unassignedLeads];
    if (priorityFirst) {
      const priorityOrder = { 'Высокий': 1, 'Средний': 2, 'Низкий': 3 };
      leadsToAssign.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    // Получение текущей нагрузки сотрудников
    const employeeLoads = availableEmployees.map(employee => ({
      ...employee,
      currentLoad: this._leads.filter(lead => lead.assigned_to === employee.id).length,
      remainingCapacity: Math.max(0, (employee.capacity || 10) - this._leads.filter(lead => lead.assigned_to === employee.id).length)
    }));

    // Учет максимального количества лидов на сотрудника (если указано)
    if (maxLeadsPerEmployee) {
      employeeLoads.forEach(emp => {
        emp.remainingCapacity = Math.min(emp.remainingCapacity, maxLeadsPerEmployee - emp.currentLoad);
      });
    }

    // Распределение лидов по умному алгоритму
    const updatedLeads = leadsToAssign.map(lead => {
      // Если нет сотрудников с оставшейся емкостью, пропускаем
      if (!employeeLoads.some(emp => emp.remainingCapacity > 0)) {
        return lead;
      }

      // Находим лучшее соответствие
      const bestMatch = this.findBestEmployeeMatch(lead, 
        employeeLoads.filter(e => e.remainingCapacity > 0), 
        options
      );
      
      if (bestMatch) {
        // Обновляем оставшуюся емкость сотрудника
        const empLoad = employeeLoads.find(e => e.id === bestMatch.id);
        if (empLoad) {
          empLoad.currentLoad += 1;
          empLoad.remainingCapacity -= 1;
        }
        
        // Возвращаем обновленного лида
        return { 
          ...lead, 
          assigned_to: bestMatch.id,
          last_updated: new Date().toISOString()
        };
      }
      
      return lead;
    });

    return updatedLeads;
  }

  /**
   * Получение мок-данных истории клиентов
   * @returns {Promise<Array>} - История взаимодействия с клиентами
   * @private
   */
  async _getMockClientHistory() {
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
      // Связи между клиентами и сотрудниками
      { clientId: 1001, employeeId: 1, lastInteraction: '2025-03-10', interactionsCount: 3 },
      { clientId: 1002, employeeId: 2, lastInteraction: '2025-03-12', interactionsCount: 2 },
      { clientId: 1003, employeeId: 1, lastInteraction: '2025-03-05', interactionsCount: 5 },
      { clientId: 1004, employeeId: 3, lastInteraction: '2025-03-08', interactionsCount: 1 },
      { clientId: 1006, employeeId: 1, lastInteraction: '2025-03-15', interactionsCount: 4 },
      { clientId: 1008, employeeId: 4, lastInteraction: '2025-03-01', interactionsCount: 2 },
      { clientId: 1010, employeeId: 2, lastInteraction: '2025-03-18', interactionsCount: 3 }
    ];
  }

  /**
   * Получение мок-данных специализаций сотрудников
   * @returns {Promise<Object>} - Специализации по сотрудникам
   * @private
   */
  async _getMockEmployeeSpecializations() {
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      // ID сотрудника: его специализации
      1: {
        industries: ['IT', 'Финансы', 'Телекоммуникации'],
        businessSizes: ['Крупный', 'Средний'],
        leadSources: ['Выставка', 'Рекомендация', 'Партнер']
      },
      2: {
        industries: ['Розничная торговля', 'Образование', 'Здравоохранение'],
        businessSizes: ['Средний', 'Малый'],
        leadSources: ['Сайт', 'Email-рассылка']
      },
      3: {
        industries: ['Производство', 'Строительство', 'Логистика'],
        businessSizes: ['Крупный', 'Средний'],
        leadSources: ['Звонок', 'Партнер']
      },
      4: {
        industries: ['Гостиничный бизнес', 'Общественное питание', 'Розничная торговля'],
        businessSizes: ['Малый', 'Средний'],
        leadSources: ['Сайт', 'Звонок']
      },
      5: {
        industries: ['Образование', 'Некоммерческие организации'],
        businessSizes: ['Малый'],
        leadSources: ['Сайт', 'Email-рассылка']
      }
    };
  }

  /**
   * Получение мок-данных метрик производительности сотрудников
   * @returns {Promise<Object>} - Метрики по сотрудникам
   * @private
   */
  async _getMockEmployeePerformanceMetrics() {
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      // ID сотрудника: его метрики
      1: {
        kpi: 85,
        conversion: 28,
        averageDealValue: 450000,
        averageClosingDays: 18,
        returnClientRate: 68
      },
      2: {
        kpi: 76,
        conversion: 22,
        averageDealValue: 220000,
        averageClosingDays: 22,
        returnClientRate: 52
      },
      3: {
        kpi: 82,
        conversion: 25,
        averageDealValue: 380000,
        averageClosingDays: 20,
        returnClientRate: 60
      },
      4: {
        kpi: 65,
        conversion: 18,
        averageDealValue: 180000,
        averageClosingDays: 25,
        returnClientRate: 45
      },
      5: {
        kpi: 60,
        conversion: 15,
        averageDealValue: 120000,
        averageClosingDays: 28,
        returnClientRate: 35
      }
    };
  }

  /**
   * Получение текущего состояния загрузки
   * @returns {boolean} - Состояние загрузки
   */
  get isLoading() {
    return this._isLoading;
  }

  /**
   * Получение текущей ошибки
   * @returns {string|null} - Текст ошибки или null
   */
  get error() {
    return this._error;
  }
}

// Экспорт единственного экземпляра сервиса (Singleton)
export const smartLeadDistributionService = new SmartLeadDistributionService();

// Экспорт функций-оберток для удобства использования
export const initializeSmartDistribution = () => smartLeadDistributionService.initialize();
export const smartAssignLeads = (options) => smartLeadDistributionService.smartAssignLeads(options);
export const getExtendedEmployeeStats = () => smartLeadDistributionService.getEmployeeStats();