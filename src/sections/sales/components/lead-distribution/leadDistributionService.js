// src/sections/sales/components/lead-distribution/leadDistributionService.js
import { shouldUseMockData, mockApiCall } from '../../../../utils/mock-data-utils';

/**
 * Класс сервиса для распределения лидов
 * Обеспечивает функционал для работы с лидами и их назначением менеджерам
 */
class LeadDistributionService {
  constructor() {
    this._employees = [];
    this._leads = [];
    this._isLoading = false;
    this._error = null;
  }

  /**
   * Загрузка данных о сотрудниках
   * @param {boolean} forceFetch - Принудительно запросить данные с сервера
   * @returns {Promise<Array>} - Массив сотрудников
   */
  async fetchEmployees(forceFetch = false) {
    try {
      this._isLoading = true;
      this._error = null;

      // Если данные уже загружены и не требуется принудительная загрузка
      if (this._employees.length > 0 && !forceFetch) {
        this._isLoading = false;
        return this._employees;
      }

      // Запрос к API или мок-данным
      if (shouldUseMockData()) {
        const mockEmployees = await this._getMockEmployees();
        this._employees = mockEmployees;
      } else {
        // Реальный API запрос (будет реализован позже)
        const response = await fetch('/api/sales/employees');
        const data = await response.json();
        this._employees = data;
      }

      this._isLoading = false;
      return this._employees;
    } catch (error) {
      this._isLoading = false;
      this._error = error.message || 'Ошибка при загрузке сотрудников';
      console.error('Error fetching employees:', error);
      throw new Error(this._error);
    }
  }

  /**
   * Загрузка данных о лидах
   * @param {boolean} forceFetch - Принудительно запросить данные с сервера
   * @returns {Promise<Array>} - Массив лидов
   */
  async fetchLeads(forceFetch = false) {
    try {
      this._isLoading = true;
      this._error = null;

      // Если данные уже загружены и не требуется принудительная загрузка
      if (this._leads.length > 0 && !forceFetch) {
        this._isLoading = false;
        return this._leads;
      }

      // Запрос к API или мок-данным
      if (shouldUseMockData()) {
        const mockLeads = await this._getMockLeads();
        this._leads = mockLeads;
      } else {
        // Реальный API запрос (будет реализован позже)
        const response = await fetch('/api/sales/leads');
        const data = await response.json();
        this._leads = data;
      }

      this._isLoading = false;
      return this._leads;
    } catch (error) {
      this._isLoading = false;
      this._error = error.message || 'Ошибка при загрузке лидов';
      console.error('Error fetching leads:', error);
      throw new Error(this._error);
    }
  }

  /**
   * Назначить лида сотруднику
   * @param {number} leadId - ID лида
   * @param {number|null} employeeId - ID сотрудника (null для отмены назначения)
   * @returns {Promise<Object>} - Обновленный лид
   */
  async assignLead(leadId, employeeId) {
    try {
      this._isLoading = true;
      this._error = null;

      // Обновление локальных данных
      const leadIndex = this._leads.findIndex(lead => lead.id === leadId);
      if (leadIndex === -1) {
        throw new Error(`Лид с ID ${leadId} не найден`);
      }

      // Подготовка обновленного лида
      const updatedLead = { 
        ...this._leads[leadIndex], 
        assigned_to: employeeId,
        last_updated: new Date().toISOString()
      };

      // Запрос к API или обновление мок-данных
      if (shouldUseMockData()) {
        // Имитация задержки API
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Обновление в локальном массиве
        this._leads[leadIndex] = updatedLead;
      } else {
        // Реальный API запрос (будет реализован позже)
        const response = await fetch(`/api/sales/leads/${leadId}/assign`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ employeeId }),
        });
        
        const data = await response.json();
        
        // Обновление в локальном массиве
        this._leads[leadIndex] = data;
      }

      this._isLoading = false;
      return this._leads[leadIndex];
    } catch (error) {
      this._isLoading = false;
      this._error = error.message || 'Ошибка при назначении лида';
      console.error('Error assigning lead:', error);
      throw new Error(this._error);
    }
  }

  /**
   * Автоматическое распределение лидов
   * @param {Object} options - Опции распределения
   * @returns {Promise<Array>} - Обновленный массив лидов
   */
  async autoAssignLeads(options = {}) {
    try {
      this._isLoading = true;
      this._error = null;

      const {
        priorityFirst = true,
        balanceLoad = true,
        considerExperience = true,
        maxLeadsPerEmployee = null,
      } = options;

      // Получение актуальных данных
      await this.fetchEmployees();
      await this.fetchLeads();

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
        
        // Логика распределения для мок-данных
        const updatedLeads = await this._mockAutoAssignLeads(unassignedLeads, availableEmployees, options);
        
        // Обновление локальных данных
        updatedLeads.forEach(updatedLead => {
          const index = this._leads.findIndex(lead => lead.id === updatedLead.id);
          if (index !== -1) {
            this._leads[index] = updatedLead;
          }
        });
      } else {
        // Реальный API запрос (будет реализован позже)
        const response = await fetch('/api/sales/leads/auto-assign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(options),
        });
        
        const data = await response.json();
        this._leads = data;
      }

      this._isLoading = false;
      return this._leads;
    } catch (error) {
      this._isLoading = false;
      this._error = error.message || 'Ошибка при автоматическом распределении';
      console.error('Error auto-assigning leads:', error);
      throw new Error(this._error);
    }
  }

  /**
   * Добавление нового лида
   * @param {Object} leadData - Данные нового лида
   * @returns {Promise<Object>} - Созданный лид
   */
  async addLead(leadData) {
    try {
      this._isLoading = true;
      this._error = null;

      // Запрос к API или обновление мок-данных
      if (shouldUseMockData()) {
        // Имитация задержки API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Создание нового лида
        const newLead = {
          id: Math.max(0, ...this._leads.map(l => l.id)) + 1,
          ...leadData,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        };
        
        // Добавление в массив
        this._leads.push(newLead);
        
        this._isLoading = false;
        return newLead;
      } else {
        // Реальный API запрос (будет реализован позже)
        const response = await fetch('/api/sales/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(leadData),
        });
        
        const data = await response.json();
        
        // Добавление в массив
        this._leads.push(data);
        
        this._isLoading = false;
        return data;
      }
    } catch (error) {
      this._isLoading = false;
      this._error = error.message || 'Ошибка при добавлении лида';
      console.error('Error adding lead:', error);
      throw new Error(this._error);
    }
  }

  /**
   * Обновление данных лида
   * @param {number} leadId - ID лида
   * @param {Object} leadData - Новые данные лида
   * @returns {Promise<Object>} - Обновленный лид
   */
  async updateLead(leadId, leadData) {
    try {
      this._isLoading = true;
      this._error = null;

      // Поиск лида в массиве
      const leadIndex = this._leads.findIndex(lead => lead.id === leadId);
      if (leadIndex === -1) {
        throw new Error(`Лид с ID ${leadId} не найден`);
      }

      // Запрос к API или обновление мок-данных
      if (shouldUseMockData()) {
        // Имитация задержки API
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Обновление лида
        const updatedLead = {
          ...this._leads[leadIndex],
          ...leadData,
          last_updated: new Date().toISOString()
        };
        
        // Обновление в массиве
        this._leads[leadIndex] = updatedLead;
        
        this._isLoading = false;
        return updatedLead;
      } else {
        // Реальный API запрос (будет реализован позже)
        const response = await fetch(`/api/sales/leads/${leadId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(leadData),
        });
        
        const data = await response.json();
        
        // Обновление в массиве
        this._leads[leadIndex] = data;
        
        this._isLoading = false;
        return data;
      }
    } catch (error) {
      this._isLoading = false;
      this._error = error.message || 'Ошибка при обновлении лида';
      console.error('Error updating lead:', error);
      throw new Error(this._error);
    }
  }

  /**
   * Удаление лида
   * @param {number} leadId - ID лида
   * @returns {Promise<boolean>} - Результат удаления
   */
  async deleteLead(leadId) {
    try {
      this._isLoading = true;
      this._error = null;

      // Поиск лида в массиве
      const leadIndex = this._leads.findIndex(lead => lead.id === leadId);
      if (leadIndex === -1) {
        throw new Error(`Лид с ID ${leadId} не найден`);
      }

      // Запрос к API или обновление мок-данных
      if (shouldUseMockData()) {
        // Имитация задержки API
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Удаление из массива
        this._leads.splice(leadIndex, 1);
        
        this._isLoading = false;
        return true;
      } else {
        // Реальный API запрос (будет реализован позже)
        const response = await fetch(`/api/sales/leads/${leadId}`, {
          method: 'DELETE',
        });
        
        // Удаление из массива
        this._leads.splice(leadIndex, 1);
        
        this._isLoading = false;
        return response.ok;
      }
    } catch (error) {
      this._isLoading = false;
      this._error = error.message || 'Ошибка при удалении лида';
      console.error('Error deleting lead:', error);
      throw new Error(this._error);
    }
  }

  /**
   * Получение статистики по распределению лидов
   * @returns {Promise<Object>} - Статистика распределения
   */
  async getDistributionStats() {
    try {
      this._isLoading = true;
      this._error = null;

      // Получение актуальных данных
      await this.fetchEmployees();
      await this.fetchLeads();

      // Расчет статистики
      const stats = {
        total: this._leads.length,
        assigned: this._leads.filter(lead => lead.assigned_to).length,
        unassigned: this._leads.filter(lead => !lead.assigned_to).length,
        byPriority: {
          high: this._leads.filter(lead => lead.priority === 'Высокий').length,
          medium: this._leads.filter(lead => lead.priority === 'Средний').length,
          low: this._leads.filter(lead => lead.priority === 'Низкий').length
        },
        byEmployee: this._employees.map(employee => ({
          id: employee.id,
          name: employee.name,
          count: this._leads.filter(lead => lead.assigned_to === employee.id).length,
          capacity: employee.capacity || 10,
          utilization: this._leads.filter(lead => lead.assigned_to === employee.id).length / (employee.capacity || 10)
        }))
      };

      this._isLoading = false;
      return stats;
    } catch (error) {
      this._isLoading = false;
      this._error = error.message || 'Ошибка при получении статистики';
      console.error('Error getting distribution stats:', error);
      throw new Error(this._error);
    }
  }

  /**
   * Получение мок-данных о сотрудниках
   * @returns {Promise<Array>} - Массив сотрудников
   * @private
   */
  async _getMockEmployees() {
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Мок-данные о сотрудниках
    return [
      {
        id: 1,
        name: 'Иванов Иван',
        role: 'Старший менеджер',
        level: 'Senior',
        avatar: null, // URL аватара
        color: '#4CAF50',
        capacity: 12,
        active: true
      },
      {
        id: 2,
        name: 'Петрова Елена',
        role: 'Менеджер',
        level: 'Middle',
        avatar: null,
        color: '#2196F3',
        capacity: 8,
        active: true
      },
      {
        id: 3,
        name: 'Сидоров Алексей',
        role: 'Менеджер',
        level: 'Middle',
        avatar: null,
        color: '#FF9800',
        capacity: 8,
        active: true
      },
      {
        id: 4,
        name: 'Козлова Мария',
        role: 'Младший менеджер',
        level: 'Junior',
        avatar: null,
        color: '#9C27B0',
        capacity: 5,
        active: true
      },
      {
        id: 5,
        name: 'Соколов Дмитрий',
        role: 'Стажер',
        level: 'Trainee',
        avatar: null,
        color: '#795548',
        capacity: 3,
        active: true
      }
    ];
  }

  /**
   * Получение мок-данных о лидах
   * @returns {Promise<Array>} - Массив лидов
   * @private
   */
  async _getMockLeads() {
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 700));

    // Мок-данные о лидах
    return [
      {
        id: 1001,
        name: 'ООО "Технопром"',
        contact: 'Иванов А.А.',
        status: 'Новый',
        priority: 'Высокий',
        potential_amount: 450000,
        contact_deadline: '25.03.2025',
        source: 'Сайт',
        created_at: '2025-03-19T10:30:00',
        last_updated: '2025-03-19T10:30:00',
        assigned_to: null
      },
      {
        id: 1002,
        name: 'ИП Сергеев',
        contact: 'Сергеев И.П.',
        status: 'Новый',
        priority: 'Средний',
        potential_amount: 120000,
        contact_deadline: '24.03.2025',
        source: 'Звонок',
        created_at: '2025-03-19T12:15:00',
        last_updated: '2025-03-19T12:15:00',
        assigned_to: 2
      },
      {
        id: 1003,
        name: 'АО "МегаСтрой"',
        contact: 'Петрова О.С.',
        status: 'Новый',
        priority: 'Высокий',
        potential_amount: 780000,
        contact_deadline: '23.03.2025',
        source: 'Выставка',
        created_at: '2025-03-19T14:45:00',
        last_updated: '2025-03-19T14:45:00',
        assigned_to: null
      },
      {
        id: 1004,
        name: 'ООО "ФинТрейд"',
        contact: 'Смирнов Д.В.',
        status: 'Новый',
        priority: 'Низкий',
        potential_amount: 85000,
        contact_deadline: '26.03.2025',
        source: 'Рекомендация',
        created_at: '2025-03-20T09:10:00',
        last_updated: '2025-03-20T09:10:00',
        assigned_to: 3
      },
      {
        id: 1005,
        name: 'ЗАО "ИнноТех"',
        contact: 'Кузнецов А.В.',
        status: 'Новый',
        priority: 'Средний',
        potential_amount: 320000,
        contact_deadline: '24.03.2025',
        source: 'Email-рассылка',
        created_at: '2025-03-20T11:30:00',
        last_updated: '2025-03-20T11:30:00',
        assigned_to: null
      },
      {
        id: 1006,
        name: 'ООО "ЭкоТранс"',
        contact: 'Никитина Е.А.',
        status: 'Новый',
        priority: 'Высокий',
        potential_amount: 550000,
        contact_deadline: '23.03.2025',
        source: 'Сайт',
        created_at: '2025-03-20T13:20:00',
        last_updated: '2025-03-20T13:20:00',
        assigned_to: 1
      },
      {
        id: 1007,
        name: 'ИП Васильев',
        contact: 'Васильев С.П.',
        status: 'Новый',
        priority: 'Низкий',
        potential_amount: 95000,
        contact_deadline: '27.03.2025',
        source: 'Звонок',
        created_at: '2025-03-20T15:45:00',
        last_updated: '2025-03-20T15:45:00',
        assigned_to: null
      },
      {
        id: 1008,
        name: 'ООО "СтройИнвест"',
        contact: 'Морозов И.Д.',
        status: 'Новый',
        priority: 'Средний',
        potential_amount: 275000,
        contact_deadline: '25.03.2025',
        source: 'Партнер',
        created_at: '2025-03-21T08:30:00',
        last_updated: '2025-03-21T08:30:00',
        assigned_to: 4
      },
      {
        id: 1009,
        name: 'АО "ТехМаш"',
        contact: 'Соколов П.Р.',
        status: 'Новый',
        priority: 'Высокий',
        potential_amount: 620000,
        contact_deadline: '24.03.2025',
        source: 'Выставка',
        created_at: '2025-03-21T10:15:00',
        last_updated: '2025-03-21T10:15:00',
        assigned_to: null
      },
      {
        id: 1010,
        name: 'ООО "МедТех"',
        contact: 'Козлова А.С.',
        status: 'Новый',
        priority: 'Средний',
        potential_amount: 190000,
        contact_deadline: '26.03.2025',
        source: 'Сайт',
        created_at: '2025-03-21T11:45:00',
        last_updated: '2025-03-21T11:45:00',
        assigned_to: 2
      }
    ];
  }

  /**
   * Логика автоматического распределения лидов для мок-данных
   * @param {Array} unassignedLeads - Нераспределенные лиды
   * @param {Array} availableEmployees - Доступные сотрудники
   * @param {Object} options - Опции распределения
   * @returns {Promise<Array>} - Обновленные лиды
   * @private
   */
  async _mockAutoAssignLeads(unassignedLeads, availableEmployees, options) {
    const {
      priorityFirst = true,
      balanceLoad = true,
      considerExperience = true,
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
        emp.remainingCapacity = Math.min(emp.remainingCapacity, maxLeadsPerEmployee);
      });
    }

    // Распределение лидов
    const updatedLeads = leadsToAssign.map(lead => {
      // Если нет сотрудников с оставшейся емкостью, пропускаем
      if (!employeeLoads.some(emp => emp.remainingCapacity > 0)) {
        return lead;
      }

      // Сортировка сотрудников по оставшейся емкости (если включена балансировка нагрузки)
      let sortedEmployees = [...employeeLoads];
      if (balanceLoad) {
        sortedEmployees.sort((a, b) => b.remainingCapacity - a.remainingCapacity);
      }

      // Учет опыта сотрудников (если включена соответствующая опция)
      // Здесь можно добавить логику, учитывающую опыт сотрудников для разных типов лидов
      // Например, назначать VIP-клиентов только старшим менеджерам
      
      // Выбор подходящего сотрудника
      const selectedEmployee = sortedEmployees.find(emp => emp.remainingCapacity > 0);
      
      if (selectedEmployee) {
        // Обновление оставшейся емкости сотрудника
        selectedEmployee.currentLoad += 1;
        selectedEmployee.remainingCapacity -= 1;
        
        // Возвращаем обновленного лида
        return { 
          ...lead, 
          assigned_to: selectedEmployee.id,
          last_updated: new Date().toISOString()
        };
      }
      
      return lead;
    });

    return updatedLeads;
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

  /**
   * Получение текущего списка сотрудников
   * @returns {Array} - Массив сотрудников
   */
  get employees() {
    return this._employees;
  }

  /**
   * Получение текущего списка лидов
   * @returns {Array} - Массив лидов
   */
  get leads() {
    return this._leads;
  }
}

// Экспорт единственного экземпляра сервиса (Singleton)
export const leadDistributionService = new LeadDistributionService();

// Экспорт классов и функций для тестирования и других целей
export { LeadDistributionService };

// Для удобства можно экспортировать функции-обертки
export const fetchEmployees = (forceFetch) => leadDistributionService.fetchEmployees(forceFetch);
export const fetchLeads = (forceFetch) => leadDistributionService.fetchLeads(forceFetch);
export const assignLead = (leadId, employeeId) => leadDistributionService.assignLead(leadId, employeeId);
export const autoAssignLeads = (options) => leadDistributionService.autoAssignLeads(options);
export const addLead = (leadData) => leadDistributionService.addLead(leadData);
export const updateLead = (leadId, leadData) => leadDistributionService.updateLead(leadId, leadData);
export const deleteLead = (leadId) => leadDistributionService.deleteLead(leadId);
export const getDistributionStats = () => leadDistributionService.getDistributionStats();