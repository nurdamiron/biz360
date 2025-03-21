// src/services/salesService.js
import axios from 'axios';
import { shouldUseMockData } from './mock/mockUtils';
import * as SalesMockApi from './mock/salesMockApi';

// Константы для API
const API_VERSION = 'v1';
const API_BASE_URL = process.env.REACT_APP_API_URL || '';
const SALES_API_PATH = `${API_BASE_URL}/api/${API_VERSION}/sales`;

/**
 * Класс для работы с API отдела продаж
 */
class SalesService {
  /**
   * Конструктор сервиса
   * @param {Object} config - Конфигурация сервиса
   */
  constructor(config = {}) {
    this.config = {
      useMock: shouldUseMockData(),
      apiUrl: SALES_API_PATH,
      mockDelay: 500,
      ...config
    };
    
    // Настраиваем axios для реальных запросов
    this.api = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Добавляем перехватчики для обработки ошибок
    this.api.interceptors.response.use(
      response => response.data,
      error => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Переключение режима работы (моки/реальное API)
   * @param {boolean} useMock - Использовать ли моки
   */
  setUseMock(useMock) {
    this.config.useMock = useMock;
    // Обновляем настройки мока (если используется SalesMockApi)
    if (SalesMockApi.setMockConfig) {
      SalesMockApi.setMockConfig({ MOCK_ENABLED: useMock });
    }
  }
  
  /**
   * Получение всех лидов
   * @returns {Promise<Array>} - Массив лидов
   */
  async getAllLeads() {
    if (this.config.useMock) {
      return SalesMockApi.getAllLeads();
    }
    
    return this.api.get('/leads');
  }
  
  /**
   * Получение нераспределенных лидов
   * @returns {Promise<Array>} - Массив нераспределенных лидов
   */
  async getUnassignedLeads() {
    if (this.config.useMock) {
      return SalesMockApi.getUnassignedLeads();
    }
    
    return this.api.get('/leads/unassigned');
  }
  
  /**
   * Получение лидов, назначенных конкретному сотруднику
   * @param {number|string} employeeId - ID сотрудника
   * @returns {Promise<Array>} - Массив лидов
   */
  async getEmployeeLeads(employeeId) {
    if (this.config.useMock) {
      return SalesMockApi.getEmployeeLeads(employeeId);
    }
    
    return this.api.get(`/employees/${employeeId}/leads`);
  }
  
  /**
   * Получение всех сотрудников отдела продаж
   * @returns {Promise<Array>} - Массив сотрудников
   */
  async getSalesEmployees() {
    if (this.config.useMock) {
      return SalesMockApi.getSalesEmployees();
    }
    
    return this.api.get('/employees');
  }
  
  /**
   * Назначение лида сотруднику
   * @param {number|string} leadId - ID лида
   * @param {number|string|null} employeeId - ID сотрудника (null для отмены назначения)
   * @returns {Promise<Object>} - Результат операции
   */
  async assignLead(leadId, employeeId) {
    if (this.config.useMock) {
      return SalesMockApi.assignLead(leadId, employeeId);
    }
    
    return this.api.post(`/leads/${leadId}/assign`, { employeeId });
  }
  
  /**
   * Массовое назначение лидов сотрудникам
   * @param {Array} assignments - Массив назначений { leadId, employeeId }
   * @returns {Promise<Object>} - Результат операции
   */
  async batchAssignLeads(assignments) {
    if (this.config.useMock) {
      // Последовательное назначение в моках для имитации массового назначения
      const results = [];
      for (const assignment of assignments) {
        const result = await SalesMockApi.assignLead(assignment.leadId, assignment.employeeId);
        results.push(result);
      }
      return { success: true, count: results.length, results };
    }
    
    return this.api.post('/leads/assign-batch', { assignments });
  }
  
  /**
   * Получение аналитики по источникам лидов
   * @returns {Promise<Array>} - Данные по источникам
   */
  async getLeadSourcesAnalytics() {
    if (this.config.useMock) {
      return SalesMockApi.getLeadSourcesAnalytics();
    }
    
    return this.api.get('/analytics/lead-sources');
  }
  
  /**
   * Получение данных воронки конверсии
   * @returns {Promise<Array>} - Данные воронки
   */
  async getConversionFunnelData() {
    if (this.config.useMock) {
      return SalesMockApi.getConversionFunnelData();
    }
    
    return this.api.get('/analytics/conversion-funnel');
  }
  
  /**
   * Получение распределения лидов по статусам
   * @returns {Promise<Array>} - Данные по статусам
   */
  async getLeadsByStatusData() {
    if (this.config.useMock) {
      return SalesMockApi.getLeadsByStatusData();
    }
    
    return this.api.get('/analytics/leads-by-status');
  }
  
  /**
   * Получение динамики показателей лидов за период
   * @param {string} period - Период (day, week, month, quarter, year)
   * @returns {Promise<Array>} - Данные по периодам
   */
  async getLeadTimeData(period = 'month') {
    if (this.config.useMock) {
      return SalesMockApi.getLeadTimeData(period);
    }
    
    return this.api.get(`/analytics/leads-time-data?period=${period}`);
  }
  
  /**
   * Получение ключевых метрик по лидам
   * @returns {Promise<Object>} - Метрики
   */
  async getLeadMetrics() {
    if (this.config.useMock) {
      return SalesMockApi.getLeadMetrics();
    }
    
    return this.api.get('/analytics/lead-metrics');
  }
  
  /**
   * Получение взаимодействий с лидами
   * @param {number|string|null} leadId - ID лида (null для всех взаимодействий)
   * @returns {Promise<Array>} - Массив взаимодействий
   */
  async getLeadInteractions(leadId = null) {
    if (this.config.useMock) {
      return SalesMockApi.getLeadInteractions(leadId);
    }
    
    const url = leadId ? `/leads/${leadId}/interactions` : '/leads/interactions';
    return this.api.get(url);
  }
  
  /**
   * Создание нового взаимодействия с лидом
   * @param {Object} interactionData - Данные взаимодействия
   * @returns {Promise<Object>} - Созданное взаимодействие
   */
  async createLeadInteraction(interactionData) {
    if (this.config.useMock) {
      return SalesMockApi.createLeadInteraction(interactionData);
    }
    
    return this.api.post('/leads/interactions', interactionData);
  }
  
  /**
   * Получение полных данных для дашборда сотрудника отдела продаж
   * @param {number|string} employeeId - ID сотрудника
   * @returns {Promise<Object>} - Данные дашборда
   */
  async getEmployeeDashboardData(employeeId) {
    if (this.config.useMock) {
      // Агрегируем данные из разных мок-сервисов
      const [
        employee,
        employeeLeads,
        leadInteractions,
        conversionFunnel,
        leadMetrics,
        leadSources
      ] = await Promise.all([
        // Получаем сотрудника
        SalesMockApi.getSalesEmployees().then(
          employees => employees.find(emp => emp.id === employeeId)
        ),
        // Получаем лиды сотрудника
        SalesMockApi.getEmployeeLeads(employeeId),
        // Получаем взаимодействия с лидами
        SalesMockApi.getLeadInteractions(),
        // Получаем данные воронки конверсии
        SalesMockApi.getConversionFunnelData(),
        // Получаем ключевые метрики
        SalesMockApi.getLeadMetrics(),
        // Получаем источники лидов
        SalesMockApi.getLeadSourcesAnalytics()
      ]);
      
      // Разделяем лиды на активные и завершенные
      const activeClients = employeeLeads.filter(lead => 
        ['Новый', 'Первичный контакт', 'Квалифицирован', 'Согласование КП', 'Переговоры', 'Подписание'].includes(lead.status)
      );
      
      const completedDeals = employeeLeads.filter(lead => 
        ['Закрыт (успех)', 'Закрыт (неудача)'].includes(lead.status)
      );
      
      // Фильтруем взаимодействия только для этого сотрудника
      const employeeInteractions = leadInteractions.filter(interaction => 
        interaction.created_by === employeeId
      );
      
      // Возвращаем агрегированные данные
      return {
        employee,
        activeClients,
        completedDeals,
        newAssignments: [], // Здесь можно добавить новые назначения
        leadInteractions: employeeInteractions,
        conversionFunnel,
        metrics: leadMetrics,
        leadSources,
        salesPerformance: {
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
        },
        improvements: [
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
        ]
      };
    }
    
    // Реальный API запрос
    return this.api.get(`/employee/${employeeId}/dashboard`);
  }
  
  /**
   * Получение данных для доски распределения лидов
   * @returns {Promise<Object>} - Данные для доски
   */
  async getLeadDistributionBoardData() {
    if (this.config.useMock) {
      // Получаем данные из мок-сервисов
      const [employees, leads] = await Promise.all([
        SalesMockApi.getSalesEmployees(),
        SalesMockApi.getAllLeads()
      ]);
      
      return { employees, leads };
    }
    
    // Реальный API запрос
    return this.api.get('/distribution/board');
  }
  
  /**
   * Автоматическое распределение лидов
   * @param {Object} options - Опции распределения
   * @returns {Promise<Object>} - Результат операции
   */
  async autoDistributeLeads(options = {}) {
    if (this.config.useMock) {
      // Получаем данные из мок-сервисов
      const [employees, leads] = await Promise.all([
        SalesMockApi.getSalesEmployees(),
        SalesMockApi.getUnassignedLeads()
      ]);
      
      // Простой алгоритм распределения
      const assignments = [];
      leads.forEach((lead, index) => {
        const employeeIndex = index % employees.length;
        assignments.push({
          leadId: lead.id,
          employeeId: employees[employeeIndex].id
        });
      });
      
      // Применяем назначения
      return this.batchAssignLeads(assignments);
    }
    
    // Реальный API запрос
    return this.api.post('/distribution/auto', options);
  }
}

// Создаем и экспортируем экземпляр сервиса
const salesService = new SalesService();
export default salesService;

// Экспортируем класс для возможности создания дополнительных экземпляров
export { SalesService };