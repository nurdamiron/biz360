// src/sections/sales/components/lead-distribution/leadDistributionService.js
/**
 * Сервис для работы с распределением лидов
 * Обеспечивает функциональность для работы с лидами и сотрудниками, их назначение и аналитику
 */

// Функция для определения, нужно ли использовать мок-данные
export const shouldUseMockData = () => {
    // Можно настроить через переменную окружения или localStorage
    process.env.REACT_APP_USE_MOCK_DATA === 'true' || localStorage.getItem('useMockData') === 'true';
  };
  
  /**
   * Имитация задержки API для более реалистичного поведения в режиме мок-данных
   * @param {*} data - Данные, которые вернет функция после задержки
   * @param {number} delay - Задержка в миллисекундах
   * @returns {Promise<*>} - Promise с данными
   */
  export const mockApiCall = async (data, delay = 500) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return data;
  };
  
  /**
   * Класс для работы с распределением лидов
   */
  class LeadDistributionService {
    constructor() {
      this._employees = [];
      this._leads = [];
      this._isLoading = false;
      this._error = null;
    }
  
    /**
     * Получение списка сотрудников
     * @param {boolean} force - Принудительное обновление данных
     * @returns {Promise<Array>} - Список сотрудников
     */
    async fetchEmployees(force = false) {
      try {
        if (this._employees.length > 0 && !force) {
          return this._employees;
        }
  
        this._isLoading = true;
        this._error = null;
  
        if (shouldUseMockData()) {
          // Имитация API запроса с мок-данными
          const employees = await mockApiCall([
            { 
              id: 1, 
              name: 'Иванов Алексей', 
              role: 'Старший менеджер', 
              level: 'Senior',
              color: '#4caf50', 
              capacity: 8, 
              active: true 
            },
            { 
              id: 2, 
              name: 'Петрова Мария', 
              role: 'Менеджер', 
              level: 'Middle',
              color: '#2196f3', 
              capacity: 6, 
              active: true 
            },
            { 
              id: 3, 
              name: 'Сидоров Иван', 
              role: 'Младший менеджер', 
              level: 'Junior',
              color: '#ff9800', 
              capacity: 4, 
              active: true 
            },
            { 
              id: 4, 
              name: 'Козлова Анна', 
              role: 'Руководитель группы', 
              level: 'Team Lead',
              color: '#9c27b0', 
              capacity: 5, 
              active: true 
            },
            { 
              id: 5, 
              name: 'Николаев Дмитрий', 
              role: 'Менеджер', 
              level: 'Middle',
              color: '#f44336', 
              capacity: 6, 
              active: true 
            }
          ]);
          
          this._employees = employees;
        } else {
          // Реальный API запрос
          const response = await fetch('/api/sales/employees');
          this._employees = await response.json();
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
     * Получение списка лидов
     * @param {boolean} force - Принудительное обновление данных
     * @returns {Promise<Array>} - Список лидов
     */
    async fetchLeads(force = false) {
      try {
        if (this._leads.length > 0 && !force) {
          return this._leads;
        }
  
        this._isLoading = true;
        this._error = null;
  
        if (shouldUseMockData()) {
          // Имитация API запроса с мок-данными
          const leads = await mockApiCall([
            {
              id: 101,
              name: 'ООО "ТехноПром"',
              contact: 'Алексеев И.П.',
              status: 'Новый',
              priority: 'Высокий',
              source: 'Сайт',
              potential_amount: 850000,
              contact_deadline: '25.03.2025',
              assigned_to: null,
              industry: 'IT',
              business_size: 'Средний',
              client_id: 1001,
              created_at: '2025-03-18T10:30:00Z'
            },
            {
              id: 102,
              name: 'ИП Смирнова',
              contact: 'Смирнова А.В.',
              status: 'Новый',
              priority: 'Средний',
              source: 'Звонок',
              potential_amount: 120000,
              contact_deadline: '26.03.2025',
              assigned_to: 2,
              industry: 'Розничная торговля',
              business_size: 'Малый',
              client_id: 1002,
              created_at: '2025-03-18T11:45:00Z'
            },
            {
              id: 103,
              name: 'АО "СтройМастер"',
              contact: 'Петров С.Н.',
              status: 'Новый',
              priority: 'Высокий',
              source: 'Выставка',
              potential_amount: 1200000,
              contact_deadline: '27.03.2025',
              assigned_to: 1,
              industry: 'Строительство',
              business_size: 'Крупный',
              client_id: 1003,
              created_at: '2025-03-18T14:20:00Z'
            },
            {
              id: 104,
              name: 'ООО "ЭкоФерма"',
              contact: 'Иванова Е.А.',
              status: 'Новый',
              priority: 'Низкий',
              source: 'Email-рассылка',
              potential_amount: 350000,
              contact_deadline: '28.03.2025',
              assigned_to: null,
              industry: 'Сельское хозяйство',
              business_size: 'Средний',
              client_id: 1004,
              created_at: '2025-03-19T09:15:00Z'
            },
            {
              id: 105,
              name: 'ООО "Логистик Плюс"',
              contact: 'Козлов А.М.',
              status: 'Новый',
              priority: 'Средний',
              source: 'Рекомендация',
              potential_amount: 720000,
              contact_deadline: '29.03.2025',
              assigned_to: 3,
              industry: 'Логистика',
              business_size: 'Средний',
              client_id: 1005,
              created_at: '2025-03-19T10:30:00Z'
            },
            {
              id: 106,
              name: 'ИП Кузнецов',
              contact: 'Кузнецов Д.И.',
              status: 'Новый',
              priority: 'Низкий',
              source: 'Сайт',
              potential_amount: 180000,
              contact_deadline: '24.03.2025',
              assigned_to: null,
              industry: 'Услуги',
              business_size: 'Малый',
              client_id: 1006,
              created_at: '2025-03-19T13:45:00Z'
            },
            {
              id: 107,
              name: 'ЗАО "МедТехника"',
              contact: 'Соколова М.А.',
              status: 'Новый',
              priority: 'Высокий',
              source: 'Партнер',
              potential_amount: 950000,
              contact_deadline: '25.03.2025',
              assigned_to: 4,
              industry: 'Здравоохранение',
              business_size: 'Крупный',
              client_id: 1007,
              created_at: '2025-03-20T09:20:00Z'
            },
            {
              id: 108,
              name: 'ООО "Образовательные технологии"',
              contact: 'Морозов И.К.',
              status: 'Новый',
              priority: 'Средний',
              source: 'Выставка',
              potential_amount: 420000,
              contact_deadline: '26.03.2025',
              assigned_to: null,
              industry: 'Образование',
              business_size: 'Средний',
              client_id: 1008,
              created_at: '2025-03-20T11:10:00Z'
            },
            {
              id: 109,
              name: 'ООО "РемСтрой"',
              contact: 'Новиков П.А.',
              status: 'Новый',
              priority: 'Низкий',
              source: 'Звонок',
              potential_amount: 280000,
              contact_deadline: '27.03.2025',
              assigned_to: 2,
              industry: 'Строительство',
              business_size: 'Малый',
              client_id: 1009,
              created_at: '2025-03-20T14:30:00Z'
            },
            {
              id: 110,
              name: 'ООО "ФинКонсалт"',
              contact: 'Федорова А.С.',
              status: 'Новый',
              priority: 'Высокий',
              source: 'Рекомендация',
              potential_amount: 1500000,
              contact_deadline: '28.03.2025',
              assigned_to: null,
              industry: 'Финансы',
              business_size: 'Крупный',
              client_id: 1010,
              created_at: '2025-03-21T10:15:00Z'
            }
          ]);
          
          this._leads = leads;
        } else {
          // Реальный API запрос
          const response = await fetch('/api/sales/leads');
          this._leads = await response.json();
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
     * Назначение лида сотруднику
     * @param {number} leadId - ID лида
     * @param {number|null} employeeId - ID сотрудника, null для отмены назначения
     * @returns {Promise<Object>} - Обновленный лид
     */
    async assignLead(leadId, employeeId) {
      try {
        this._isLoading = true;
        this._error = null;
  
        // Находим лид в списке
        const leadIndex = this._leads.findIndex(lead => lead.id === leadId);
        if (leadIndex === -1) {
          throw new Error(`Лид с ID ${leadId} не найден`);
        }
  
        // Если указан employeeId, проверяем существование сотрудника
        if (employeeId !== null) {
          const employeeExists = this._employees.some(emp => emp.id === employeeId);
          if (!employeeExists) {
            throw new Error(`Сотрудник с ID ${employeeId} не найден`);
          }
        }
  
        if (shouldUseMockData()) {
          // Имитация API запроса с мок-данными
          await mockApiCall(null, 300); // имитация задержки
          
          // Обновляем список лидов
          const updatedLead = {
            ...this._leads[leadIndex],
            assigned_to: employeeId,
            last_updated: new Date().toISOString()
          };
          
          this._leads[leadIndex] = updatedLead;
          
          this._isLoading = false;
          return updatedLead;
        } else {
          // Реальный API запрос
          const response = await fetch(`/api/sales/leads/${leadId}/assign`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ employeeId }),
          });
          
          const updatedLead = await response.json();
          
          // Обновляем список лидов
          this._leads[leadIndex] = updatedLead;
          
          this._isLoading = false;
          return updatedLead;
        }
      } catch (error) {
        this._isLoading = false;
        this._error = error.message || 'Ошибка при назначении лида';
        console.error('Error assigning lead:', error);
        throw new Error(this._error);
      }
    }
  
    /**
     * Автоматическое назначение лидов
     * @param {Object} options - Опции назначения
     * @returns {Promise<Array>} - Обновленный список лидов
     */
    async autoAssignLeads(options = {}) {
      try {
        this._isLoading = true;
        this._error = null;
  
        // Опции по умолчанию
        const defaultOptions = {
          onlyUnassigned: true,   // Только нераспределенные лиды
          balanceLoad: true,      // Балансировать нагрузку
          considerPriority: true, // Учитывать приоритет
          maxPerEmployee: null    // Максимальное количество лидов на сотрудника
        };
  
        // Объединяем опции по умолчанию с переданными
        const finalOptions = { ...defaultOptions, ...options };
  
        if (shouldUseMockData()) {
          // Имитация API запроса с мок-данными
          await mockApiCall(null, 800); // имитация задержки
          
          // Получаем доступных активных сотрудников
          const availableEmployees = this._employees.filter(emp => emp.active !== false);
          if (availableEmployees.length === 0) {
            throw new Error('Нет доступных сотрудников для назначения');
          }
          
          // Получаем лиды для назначения
          let leadsToAssign = finalOptions.onlyUnassigned
            ? this._leads.filter(lead => !lead.assigned_to)
            : [...this._leads];
          
          // Если нет лидов для назначения, возвращаем текущий список
          if (leadsToAssign.length === 0) {
            this._isLoading = false;
            return this._leads;
          }
          
          // Сортируем лиды по приоритету (если включена опция)
          if (finalOptions.considerPriority) {
            const priorityOrder = { 'Высокий': 1, 'Средний': 2, 'Низкий': 3 };
            leadsToAssign.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
          }
          
          // Вычисляем текущую нагрузку сотрудников
          const employeeLoads = {};
          this._employees.forEach(emp => {
            employeeLoads[emp.id] = this._leads.filter(lead => lead.assigned_to === emp.id).length;
          });
          
          // Обновляем лиды, назначая их сотрудникам
          const updatedLeads = [...this._leads];
          leadsToAssign.forEach(lead => {
            // Находим сотрудника с наименьшей нагрузкой
            let bestEmployeeId = null;
            let lowestLoad = Infinity;
            
            availableEmployees.forEach(emp => {
              const currentLoad = employeeLoads[emp.id] || 0;
              const maxLoad = finalOptions.maxPerEmployee || emp.capacity || 10;
              
              // Проверяем максимальную нагрузку
              if (currentLoad >= maxLoad) return;
              
              // Обновляем наименее загруженного сотрудника
              if (currentLoad < lowestLoad) {
                lowestLoad = currentLoad;
                bestEmployeeId = emp.id;
              }
            });
            
            // Если нашли подходящего сотрудника, назначаем ему лид
            if (bestEmployeeId !== null) {
              const leadIndex = updatedLeads.findIndex(l => l.id === lead.id);
              if (leadIndex !== -1) {
                updatedLeads[leadIndex] = {
                  ...updatedLeads[leadIndex],
                  assigned_to: bestEmployeeId,
                  last_updated: new Date().toISOString()
                };
                
                // Обновляем нагрузку сотрудника
                employeeLoads[bestEmployeeId] = (employeeLoads[bestEmployeeId] || 0) + 1;
              }
            }
          });
          
          // Обновляем список лидов
          this._leads = updatedLeads;
          
          this._isLoading = false;
          return this._leads;
        } else {
          // Реальный API запрос
          const response = await fetch('/api/sales/leads/auto-assign', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(finalOptions),
          });
          
          const updatedLeads = await response.json();
          this._leads = updatedLeads;
          
          this._isLoading = false;
          return this._leads;
        }
      } catch (error) {
        this._isLoading = false;
        this._error = error.message || 'Ошибка при автоматическом назначении лидов';
        console.error('Error auto-assigning leads:', error);
        throw new Error(this._error);
      }
    }
  
    /**
     * Получение статистики распределения лидов
     * @returns {Promise<Object>} - Объект статистики
     */
    async getDistributionStats() {
      try {
        if (shouldUseMockData()) {
          const stats = await this._generateMockStats();
          return stats;
        } else {
          // Реальный API запрос
          const response = await fetch('/api/sales/leads/stats');
          return await response.json();
        }
      } catch (error) {
        console.error('Error getting distribution stats:', error);
        throw new Error('Ошибка при получении статистики распределения');
      }
    }
  
    /**
     * Добавление нового лида
     * @param {Object} leadData - Данные нового лида
     * @returns {Promise<Object>} - Новый лид
     */
    async addLead(leadData) {
      try {
        this._isLoading = true;
        this._error = null;
  
        if (shouldUseMockData()) {
          // Имитация API запроса с мок-данными
          await mockApiCall(null, 500); // имитация задержки
          
          // Создаем новый лид
          const newLead = {
            id: Math.max(...this._leads.map(lead => lead.id), 0) + 1, // Генерируем уникальный ID
            ...leadData,
            status: leadData.status || 'Новый',
            assigned_to: leadData.assigned_to || null,
            created_at: new Date().toISOString(),
            client_id: Math.floor(Math.random() * 1000) + 2000 // Генерируем случайный client_id
          };
          
          // Добавляем лид в список
          this._leads.push(newLead);
          
          this._isLoading = false;
          return newLead;
        } else {
          // Реальный API запрос
          const response = await fetch('/api/sales/leads', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData),
          });
          
          const newLead = await response.json();
          
          // Добавляем лид в список
          this._leads.push(newLead);
          
          this._isLoading = false;
          return newLead;
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
     * @param {Object} leadData - Обновленные данные лида
     * @returns {Promise<Object>} - Обновленный лид
     */
    async updateLead(leadId, leadData) {
      try {
        this._isLoading = true;
        this._error = null;
  
        // Находим лид в списке
        const leadIndex = this._leads.findIndex(lead => lead.id === leadId);
        if (leadIndex === -1) {
          throw new Error(`Лид с ID ${leadId} не найден`);
        }
  
        if (shouldUseMockData()) {
          // Имитация API запроса с мок-данными
          await mockApiCall(null, 300); // имитация задержки
          
          // Обновляем список лидов
          const updatedLead = {
            ...this._leads[leadIndex],
            ...leadData,
            last_updated: new Date().toISOString()
          };
          
          this._leads[leadIndex] = updatedLead;
          
          this._isLoading = false;
          return updatedLead;
        } else {
          // Реальный API запрос
          const response = await fetch(`/api/sales/leads/${leadId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData),
          });
          
          const updatedLead = await response.json();
          
          // Обновляем список лидов
          this._leads[leadIndex] = updatedLead;
          
          this._isLoading = false;
          return updatedLead;
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
     * @returns {Promise<boolean>} - Результат операции
     */
    async deleteLead(leadId) {
      try {
        this._isLoading = true;
        this._error = null;
  
        // Находим лид в списке
        const leadIndex = this._leads.findIndex(lead => lead.id === leadId);
        if (leadIndex === -1) {
          throw new Error(`Лид с ID ${leadId} не найден`);
        }
  
        if (shouldUseMockData()) {
          // Имитация API запроса с мок-данными
          await mockApiCall(null, 300); // имитация задержки
          
          // Удаляем лид из списка
          this._leads.splice(leadIndex, 1);
          
          this._isLoading = false;
          return true;
        } else {
          // Реальный API запрос
          await fetch(`/api/sales/leads/${leadId}`, {
            method: 'DELETE',
          });
          
          // Удаляем лид из списка
          this._leads.splice(leadIndex, 1);
          
          this._isLoading = false;
          return true;
        }
      } catch (error) {
        this._isLoading = false;
        this._error = error.message || 'Ошибка при удалении лида';
        console.error('Error deleting lead:', error);
        throw new Error(this._error);
      }
    }
  
    /**
     * Генерация мок-статистики на основе текущих данных
     * @private
     * @returns {Promise<Object>} - Объект статистики
     */
    async _generateMockStats() {
      // Убедимся, что у нас есть данные о лидах и сотрудниках
      if (this._leads.length === 0) {
        await this.fetchLeads();
      }
      if (this._employees.length === 0) {
        await this.fetchEmployees();
      }
  
      // Рассчитываем базовую статистику
      const totalLeads = this._leads.length;
      const assignedLeads = this._leads.filter(lead => lead.assigned_to !== null).length;
      const unassignedLeads = totalLeads - assignedLeads;
  
      // Статистика по приоритету
      const highPriorityLeads = this._leads.filter(lead => lead.priority === 'Высокий').length;
      const mediumPriorityLeads = this._leads.filter(lead => lead.priority === 'Средний').length;
      const lowPriorityLeads = this._leads.filter(lead => lead.priority === 'Низкий').length;
  
      // Статистика по сотрудникам
      const byEmployee = this._employees.map(emp => {
        const empLeads = this._leads.filter(lead => lead.assigned_to === emp.id);
        const highPriority = empLeads.filter(lead => lead.priority === 'Высокий').length;
        
        return {
          id: emp.id,
          name: emp.name,
          total: empLeads.length,
          capacity: emp.capacity || 10,
          utilization: empLeads.length / (emp.capacity || 10),
          highPriority
        };
      });
  
      // Имитация задержки API
      await mockApiCall(null, 300);
  
      return {
        total: totalLeads,
        assigned: assignedLeads,
        unassigned: unassignedLeads,
        byPriority: {
          high: highPriorityLeads,
          medium: mediumPriorityLeads,
          low: lowPriorityLeads
        },
        byEmployee,
        updated: new Date().toISOString()
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
  export const leadDistributionService = new LeadDistributionService();
  
  // Экспорт функций-оберток для удобства использования
  export const fetchEmployees = (force) => leadDistributionService.fetchEmployees(force);
  export const fetchLeads = (force) => leadDistributionService.fetchLeads(force);
  export const assignLead = (leadId, employeeId) => leadDistributionService.assignLead(leadId, employeeId);
  export const autoAssignLeads = (options) => leadDistributionService.autoAssignLeads(options);
  export const addLead = (leadData) => leadDistributionService.addLead(leadData);
  export const updateLead = (leadId, leadData) => leadDistributionService.updateLead(leadId, leadData);
  export const deleteLead = (leadId) => leadDistributionService.deleteLead(leadId);
  export const getDistributionStats = () => leadDistributionService.getDistributionStats();