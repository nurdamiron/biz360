// src/sections/sales/components/lead-distribution/leadDistributionService.js
import { shouldUseMockData } from 'src/global-config';

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

// Мок-данные для сотрудников
const MOCK_EMPLOYEES = [
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
];

// Мок-данные для лидов
const MOCK_LEADS = [
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
  }
];

/**
 * Класс для работы с распределением лидов
 */
class LeadDistributionService {
  constructor() {
    this._employees = [];
    this._leads = [];
    this._isLoading = false;
    this._error = null;
    this._stats = null;
    this._extendedStats = null;
    this._lastFetch = 0;
  }

  /**
   * Получение списка сотрудников отдела продаж
   * @param {boolean} force - Принудительное обновление данных
   * @returns {Promise<Array>} - Список сотрудников
   */
  async fetchSalesEmployees(force = false) {
    try {
      const now = Date.now();
      // Если прошло менее 5 секунд с последнего запроса и у нас есть данные,
      // и не требуется принудительное обновление - возвращаем кэшированные данные
      if (!force && this._employees.length > 0 && now - this._lastFetch < 5000) {
        return this._employees;
      }

      this._isLoading = true;
      this._error = null;

      // Используем мок-данные в режиме разработки
      if (shouldUseMockData()) {
        await mockApiCall(null, 300);
        this._employees = [...MOCK_EMPLOYEES];
      } else {
        const response = await fetch('/api/sales/employees');
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        this._employees = await response.json();
      }

      this._lastFetch = now;
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
   * Получение нераспределенных лидов
   * @param {boolean} force - Принудительное обновление данных
   * @returns {Promise<Array>} - Список лидов
   */
  async fetchUnassignedLeads(force = false) {
    try {
      const now = Date.now();
      // Если прошло менее 5 секунд с последнего запроса и у нас есть данные,
      // и не требуется принудительное обновление - возвращаем кэшированные данные
      if (!force && this._leads.length > 0 && now - this._lastFetch < 5000) {
        return this._leads;
      }

      this._isLoading = true;
      this._error = null;

      // Используем мок-данные в режиме разработки
      if (shouldUseMockData()) {
        await mockApiCall(null, 300);
        this._leads = [...MOCK_LEADS];
      } else {
        const response = await fetch('/api/sales/leads/unassigned');
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        this._leads = await response.json();
      }

      this._lastFetch = now;
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
   * Получение всех лидов
   * @param {boolean} force - Принудительное обновление данных
   * @returns {Promise<Array>} - Список всех лидов
   */
  async fetchLeads(force = false) {
    // В данной реализации просто используем метод fetchUnassignedLeads
    // В реальном API здесь будет запрос всех лидов, а не только нераспределенных
    return this.fetchUnassignedLeads(force);
  }

  /**
   * Назначение лида сотруднику
   * @param {number} leadId - ID лида
   * @param {number|null} employeeId - ID сотрудника (null для отмены назначения)
   * @returns {Promise<Object>} - Обновленный лид
   */
  async assignLead(leadId, employeeId) {
    try {
      this._isLoading = true;
      this._error = null;

      // Находим лид в локальном кэше
      const leadIndex = this._leads.findIndex(lead => lead.id === leadId);
      if (leadIndex === -1) {
        throw new Error(`Лид с ID ${leadId} не найден`);
      }

      // Если указан employeeId, проверяем существование сотрудника
      if (employeeId !== null) {
        // Если список сотрудников пуст, загружаем его
        if (this._employees.length === 0) {
          await this.fetchSalesEmployees();
        }
        
        const employeeExists = this._employees.some(emp => emp.id === employeeId);
        if (!employeeExists) {
          throw new Error(`Сотрудник с ID ${employeeId} не найден`);
        }
      }

      if (shouldUseMockData()) {
        // Имитация API запроса
        await mockApiCall(null, 300);
        
        // Обновляем локальный кэш
        const updatedLead = {
          ...this._leads[leadIndex],
          assigned_to: employeeId,
          last_updated: new Date().toISOString()
        };
        
        this._leads[leadIndex] = updatedLead;
        
        this._isLoading = false;
        return updatedLead;
      } else {
        // Выполняем реальный API запрос
        const response = await fetch(`/api/sales/leads/${leadId}/assign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ employeeId }),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const updatedLead = await response.json();
        
        // Обновляем локальный кэш
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
   * Автоматическое распределение лидов между сотрудниками
   * @param {Array} leads - Список лидов для распределения
   * @param {Array} employees - Список сотрудников
   * @returns {Promise<Array>} - Обновленный список лидов
   */
  async autoAssignLeadsToEmployees(leads = [], employees = []) {
    try {
      this._isLoading = true;
      this._error = null;

      // Если списки пустые, используем кэшированные данные или загружаем их
      let leadsToAssign = leads.length > 0 ? leads : this._leads;
      if (leadsToAssign.length === 0) {
        leadsToAssign = await this.fetchUnassignedLeads();
      }

      let availableEmployees = employees.length > 0 ? employees : this._employees;
      if (availableEmployees.length === 0) {
        availableEmployees = await this.fetchSalesEmployees();
      }

      // Получаем только нераспределенных лидов
      const unassignedLeads = leadsToAssign.filter(lead => !lead.assigned_to);
      if (unassignedLeads.length === 0) {
        this._isLoading = false;
        return leadsToAssign;
      }

      // Проверяем наличие доступных сотрудников
      const activeEmployees = availableEmployees.filter(emp => emp.active !== false);
      if (activeEmployees.length === 0) {
        throw new Error('Нет доступных сотрудников для распределения');
      }

      if (shouldUseMockData()) {
        // Имитация API запроса
        await mockApiCall(null, 800);
        
        // Сортируем лиды по приоритету
        const priorityOrder = { 'Высокий': 1, 'Средний': 2, 'Низкий': 3 };
        unassignedLeads.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        
        // Вычисляем текущую нагрузку сотрудников
        const employeeLoads = {};
        availableEmployees.forEach(emp => {
          employeeLoads[emp.id] = leadsToAssign.filter(lead => lead.assigned_to === emp.id).length;
        });
        
        // Обновляем список лидов, назначая их сотрудникам
        const updatedLeads = [...leadsToAssign];
        unassignedLeads.forEach(lead => {
          // Находим сотрудника с наименьшей нагрузкой
          let bestEmployeeId = null;
          let lowestLoad = Infinity;
          
          activeEmployees.forEach(emp => {
            const currentLoad = employeeLoads[emp.id] || 0;
            const maxLoad = emp.capacity || 10;
            
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
        
        // Обновляем кэш
        this._leads = updatedLeads;
        
        this._isLoading = false;
        return updatedLeads;
      } else {
        // Выполняем реальный API запрос
        const response = await fetch('/api/sales/leads/auto-assign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leadIds: unassignedLeads.map(lead => lead.id),
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const assignedLeads = await response.json();
        
        // Обновляем кэш, заменяя только назначенные лиды
        const updatedLeads = leadsToAssign.map(lead => {
          const updatedLead = assignedLeads.find(l => l.id === lead.id);
          return updatedLead || lead;
        });
        
        this._leads = updatedLeads;
        
        this._isLoading = false;
        return updatedLeads;
      }
    } catch (error) {
      this._isLoading = false;
      this._error = error.message || 'Ошибка при автоматическом распределении лидов';
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
      // Если у нас уже есть статистика и она не устарела, используем ее
      if (this._stats && (Date.now() - (this._stats.timestamp || 0) < 5000)) {
        return this._stats;
      }

      // Если нет данных о лидах и сотрудниках, загрузим их
      if (this._leads.length === 0) {
        await this.fetchLeads();
      }
      if (this._employees.length === 0) {
        await this.fetchSalesEmployees();
      }

      if (shouldUseMockData()) {
        // Генерируем статистику на основе имеющихся данных
        const totalLeads = this._leads.length;
        const assignedLeads = this._leads.filter(lead => lead.assigned_to !== null).length;
        const unassignedLeads = totalLeads - assignedLeads;

        // Статистика по приоритету
        const highPriorityLeads = this._leads.filter(lead => lead.priority === 'Высокий').length;
        const mediumPriorityLeads = this._leads.filter(lead => lead.priority === 'Средний').length;
const lowPriorityLeads = this._leads.filter(lead => lead.priority === 'Низкий').length;

// Статистика по сотрудникам
const employeeStats = this._employees.map(emp => {
  const empLeads = this._leads.filter(lead => lead.assigned_to === emp.id);
  return {
    id: emp.id,
    name: emp.name,
    totalAssigned: empLeads.length,
    capacity: emp.capacity || 10,
    utilizationPercentage: Math.round((empLeads.length / (emp.capacity || 10)) * 100),
    highPriorityCount: empLeads.filter(lead => lead.priority === 'Высокий').length,
    conversionRate: Math.round(Math.random() * 40 + 40), // Случайное значение для демонстрации
    averageResponseTime: Math.round(Math.random() * 120 + 60), // минуты
  };
});

const stats = {
  total: totalLeads,
  assigned: assignedLeads,
  unassigned: unassignedLeads,
  assignmentRate: Math.round((assignedLeads / totalLeads) * 100),
  byPriority: {
    high: highPriorityLeads,
    medium: mediumPriorityLeads,
    low: lowPriorityLeads
  },
  employees: employeeStats,
  timestamp: Date.now(),
  updated: new Date().toISOString()
};

await mockApiCall(null, 300); // Имитируем задержку API
this._stats = stats;
return stats;
} else {
const response = await fetch('/api/sales/leads/distribution-stats');
if (!response.ok) {
  throw new Error(`API error: ${response.status}`);
}

const stats = await response.json();
stats.timestamp = Date.now();
this._stats = stats;
return stats;
}
} catch (error) {
console.error('Error getting distribution stats:', error);
throw new Error('Ошибка при получении статистики распределения: ' + error.message);
}
}

/**
 * Получение расширенной статистики сотрудников
 * @returns {Promise<Object>} - Расширенная статистика
 */
async getExtendedEmployeeStats() {
try {
  // Если у нас уже есть расширенная статистика и она не устарела, используем ее
  if (this._extendedStats && (Date.now() - (this._extendedStats.timestamp || 0) < 5000)) {
    return this._extendedStats;
  }

  // Если нет данных о лидах и сотрудниках, загрузим их
  if (this._leads.length === 0) {
    await this.fetchLeads();
  }
  if (this._employees.length === 0) {
    await this.fetchSalesEmployees();
  }

  if (shouldUseMockData()) {
    // Генерируем расширенную статистику сотрудников
    const employeeDetails = this._employees.map(emp => {
      const empLeads = this._leads.filter(lead => lead.assigned_to === emp.id);
      
      // Общая сумма потенциальных сделок
      const totalPotentialAmount = empLeads.reduce((sum, lead) => sum + (lead.potential_amount || 0), 0);
      
      // Коэффициент эффективности (для демонстрации)
      const efficiencyScore = Math.round(Math.random() * 40 + 60); // От 60 до 100
      
      // Среднее время ответа (для демонстрации)
      const averageResponseTime = Math.round(Math.random() * 120 + 30); // От 30 до 150 минут
      
      // Коэффициент конверсии (для демонстрации)
      const conversionRate = Math.round(Math.random() * 30 + 40); // От 40% до 70%
      
      // Уровень удовлетворенности клиентов (для демонстрации)
      const customerSatisfaction = Math.round(Math.random() * 20 + 80); // От 80 до 100
      
      // Распределение по приоритетам
      const highPriorityCount = empLeads.filter(lead => lead.priority === 'Высокий').length;
      const mediumPriorityCount = empLeads.filter(lead => lead.priority === 'Средний').length;
      const lowPriorityCount = empLeads.filter(lead => lead.priority === 'Низкий').length;
      
      // История эффективности (для графиков)
      const efficiencyHistory = Array(6).fill(0).map(() => Math.round(Math.random() * 30 + 60));
      
      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        level: emp.level,
        totalAssigned: empLeads.length,
        capacity: emp.capacity || 10,
        capacityUtilization: Math.round((empLeads.length / (emp.capacity || 10)) * 100),
        
        // Финансовые показатели
        totalPotentialAmount,
        averageDealSize: empLeads.length > 0 ? Math.round(totalPotentialAmount / empLeads.length) : 0,
        
        // Показатели эффективности
        efficiencyScore,
        averageResponseTime,
        conversionRate,
        customerSatisfaction,
        
        // Распределение по приоритетам
        priorityDistribution: {
          high: highPriorityCount,
          medium: mediumPriorityCount,
          low: lowPriorityCount
        },
        
        // История эффективности
        efficiencyHistory,
        
        // Специализации (для демонстрации)
        specializations: ['IT', 'Финансы', 'Строительство'].slice(0, Math.floor(Math.random() * 3) + 1),
        
        // Оптимальная нагрузка
        optimalCapacity: emp.capacity || 10,
        
        // Последняя активность
        lastActivity: new Date(Date.now() - Math.random() * 86400000).toISOString()
      };
    });

    const extendedStats = {
      overallEfficiency: Math.round(
        employeeDetails.reduce((sum, emp) => sum + emp.efficiencyScore, 0) / employeeDetails.length
      ),
      overallCapacityUtilization: Math.round(
        employeeDetails.reduce((sum, emp) => sum + emp.capacityUtilization, 0) / employeeDetails.length
      ),
      employeeDetails,
      overallConversionRate: Math.round(
        employeeDetails.reduce((sum, emp) => sum + emp.conversionRate, 0) / employeeDetails.length
      ),
      timestamp: Date.now(),
      updated: new Date().toISOString()
    };

    await mockApiCall(null, 300); // Имитируем задержку API
    this._extendedStats = extendedStats;
    return extendedStats;
  } else {
    const response = await fetch('/api/sales/employees/extended-stats');
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const extendedStats = await response.json();
    extendedStats.timestamp = Date.now();
    this._extendedStats = extendedStats;
    return extendedStats;
  }
} catch (error) {
  console.error('Error getting extended employee stats:', error);
  throw new Error('Ошибка при получении расширенной статистики сотрудников: ' + error.message);
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

  if (shouldUseMockData()) {
    // Генерируем уникальный ID
    const maxId = Math.max(...this._leads.map(lead => lead.id), 0);
    const newId = maxId + 1;
    
    // Формируем новый лид
    const newLead = {
      id: newId,
      ...leadData,
      status: leadData.status || 'Новый',
      assigned_to: leadData.assigned_to || null,
      created_at: new Date().toISOString(),
      client_id: Math.floor(Math.random() * 10000) + 1000 // Случайный ID клиента
    };
    
    await mockApiCall(null, 300); // Имитируем задержку API
    
    // Добавляем в кэш
    this._leads.push(newLead);
    
    this._isLoading = false;
    return newLead;
  } else {
    const response = await fetch('/api/sales/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const newLead = await response.json();
    
    // Добавляем в кэш
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
 * Обновление лида
 * @param {number} leadId - ID лида
 * @param {Object} leadData - Новые данные лида
 * @returns {Promise<Object>} - Обновленный лид
 */
async updateLead(leadId, leadData) {
try {
  this._isLoading = true;
  this._error = null;
  
  // Находим лид в кэше
  const leadIndex = this._leads.findIndex(lead => lead.id === leadId);
  if (leadIndex === -1) {
    throw new Error(`Лид с ID ${leadId} не найден`);
  }
  
  if (shouldUseMockData()) {
    // Имитация API запроса
    await mockApiCall(null, 300);
    
    // Обновляем лид в кэше
    const updatedLead = {
      ...this._leads[leadIndex],
      ...leadData,
      last_updated: new Date().toISOString()
    };
    
    this._leads[leadIndex] = updatedLead;
    
    this._isLoading = false;
    return updatedLead;
  } else {
    // Выполняем реальный API запрос
    const response = await fetch(`/api/sales/leads/${leadId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const updatedLead = await response.json();
    
    // Обновляем кэш
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
  
  // Находим лид в кэше
  const leadIndex = this._leads.findIndex(lead => lead.id === leadId);
  if (leadIndex === -1) {
    throw new Error(`Лид с ID ${leadId} не найден`);
  }
  
  if (shouldUseMockData()) {
    // Имитация API запроса
    await mockApiCall(null, 300);
    
    // Удаляем лид из кэша
    this._leads.splice(leadIndex, 1);
    
    this._isLoading = false;
    return true;
  } else {
    // Выполняем реальный API запрос
    const response = await fetch(`/api/sales/leads/${leadId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    // Удаляем лид из кэша
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
 * Умное распределение лидов
 * @param {Object} options - Настройки распределения
 * @returns {Promise<Array>} - Обновленный список лидов
 */
async smartAssignLeads(options = {}) {
try {
  this._isLoading = true;
  this._error = null;
  
  // Если нет данных о лидах и сотрудниках, загружаем их
  if (this._leads.length === 0) {
    await this.fetchLeads();
  }
  if (this._employees.length === 0) {
    await this.fetchSalesEmployees();
  }
  
  // Получаем нераспределенных лидов
  const unassignedLeads = this._leads.filter(lead => !lead.assigned_to);
  
  if (unassignedLeads.length === 0) {
    this._isLoading = false;
    return this._leads;
  }
  
  if (shouldUseMockData()) {
    // Имитация сложной логики умного распределения
    await mockApiCall(null, 800);
    
    // Копируем текущие лиды
    const updatedLeads = [...this._leads];
    
    // Сортируем нераспределенных лидов по приоритету
    const priorityOrder = { 'Высокий': 1, 'Средний': 2, 'Низкий': 3 };
    unassignedLeads.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    // Получаем активных сотрудников
    const activeEmployees = this._employees.filter(emp => emp.active !== false);
    
    if (activeEmployees.length === 0) {
      this._isLoading = false;
      return this._leads;
    }
    
    // Рассчитываем текущую нагрузку
    const employeeLoads = {};
    activeEmployees.forEach(emp => {
      employeeLoads[emp.id] = this._leads.filter(lead => lead.assigned_to === emp.id).length;
    });
    
    // Умное распределение лидов
    unassignedLeads.forEach(lead => {
      // Расчет наилучшего сотрудника для лида на основе множества факторов
      const employeeScores = activeEmployees.map(emp => {
        // Начальная оценка
        let score = 100;
        
        // Учитываем нагрузку (чем меньше нагрузка, тем выше оценка)
        const currentLoad = employeeLoads[emp.id] || 0;
        const capacity = emp.capacity || 10;
        score -= (currentLoad / capacity) * 30;
        
        // Учитываем приоритет лида и опыт сотрудника
        if (lead.priority === 'Высокий' && emp.level === 'Senior') {
          score += 20;
        } else if (lead.priority === 'Средний' && emp.level === 'Middle') {
          score += 15;
        } else if (lead.priority === 'Низкий' && emp.level === 'Junior') {
          score += 10;
        }
        
        // Учитываем отрасль клиента (для демонстрации)
        if (lead.industry === 'IT' && emp.id % 2 === 0) {
          score += 15;
        } else if (lead.industry === 'Финансы' && emp.id % 3 === 0) {
          score += 15;
        }
        
        return { employeeId: emp.id, score };
      });
      
      // Сортируем по оценке (от высокой к низкой)
      employeeScores.sort((a, b) => b.score - a.score);
      
      // Выбираем лучшего сотрудника
      if (employeeScores.length > 0) {
        const bestEmployeeId = employeeScores[0].employeeId;
        const leadIndex = updatedLeads.findIndex(l => l.id === lead.id);
        
        if (leadIndex !== -1) {
          // Обновляем лид
          updatedLeads[leadIndex] = {
            ...updatedLeads[leadIndex],
            assigned_to: bestEmployeeId,
            last_updated: new Date().toISOString()
          };
          
          // Увеличиваем нагрузку сотрудника
          employeeLoads[bestEmployeeId] = (employeeLoads[bestEmployeeId] || 0) + 1;
        }
      }
    });
    
    // Обновляем кэш
    this._leads = updatedLeads;
    
    this._isLoading = false;
    return updatedLeads;
  } else {
    // Выполняем реальный API запрос
    const response = await fetch('/api/sales/leads/smart-assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Обновляем кэш
    this._leads = result.leads || result;
    
    this._isLoading = false;
    return this._leads;
  }
} catch (error) {
  this._isLoading = false;
  this._error = error.message || 'Ошибка при умном распределении лидов';
  console.error('Error smart-assigning leads:', error);
  throw new Error(this._error);
}
}

// Возвращает состояние загрузки
get isLoading() {
return this._isLoading;
}

// Возвращает текущую ошибку
get error() {
return this._error;
}
}

// Создаем единственный экземпляр сервиса
const leadDistributionService = new LeadDistributionService();

// Экспортируем сервис и функции-обертки для удобства использования
// Полный блок экспорта в конце leadDistributionService.js
// Создаем единственный экземпляр сервиса

// Экспортируем сервис и функции-обертки для удобства использования
export { leadDistributionService };
export const fetchEmployees = (force) => leadDistributionService.fetchSalesEmployees(force);
export const fetchLeads = (force) => leadDistributionService.fetchLeads(force);
export const fetchSalesEmployees = (force) => leadDistributionService.fetchSalesEmployees(force);
export const fetchUnassignedLeads = (force) => leadDistributionService.fetchUnassignedLeads(force);
export const assignLead = (leadId, employeeId) => leadDistributionService.assignLead(leadId, employeeId);
export const autoAssignLeadsToEmployees = (leads, employees) => leadDistributionService.autoAssignLeadsToEmployees(leads, employees);
export const autoAssignLeads = (options) => leadDistributionService.autoAssignLeadsToEmployees(options);
export const getDistributionStats = () => leadDistributionService.getDistributionStats();
export const getEmployeeStats = () => leadDistributionService.getExtendedEmployeeStats();
export const addLead = (leadData) => leadDistributionService.addLead(leadData);
export const updateLead = (leadId, leadData) => leadDistributionService.updateLead(leadId, leadData);
export const deleteLead = (leadId) => leadDistributionService.deleteLead(leadId);
export const smartAssignLeads = (options) => leadDistributionService.smartAssignLeads(options);
