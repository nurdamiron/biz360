// src/sections/dashboard/business-owner-dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Компонент карточки для отображения сводной метрики
const MetricCard = ({ title, value, icon, trend, color }) => {
  const isPositive = trend > 0;
  
  return (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <h3 className="text-2xl font-bold mb-1">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center mt-2">
          <span className={`mr-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '↑' : '↓'}
          </span>
          <span className={`mr-1 font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(trend)}%
          </span>
          <span className="text-gray-500 text-sm">
            с прошлого месяца
          </span>
        </div>
      )}
    </div>
  );
};

// Компонент для отображения производительности отделов
const DepartmentPerformanceCard = ({ department, metrics }) => {
  // Получаем цвет в зависимости от значения KPI
  const getColorByValue = (value) => {
    if (value >= 80) return 'text-green-500 bg-green-100';
    if (value >= 60) return 'text-yellow-500 bg-yellow-100';
    return 'text-red-500 bg-red-100';
  };

  const kpiColor = getColorByValue(metrics.kpi);

  return (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="p-4 border-b">
        <h3 className="font-medium">{department}</h3>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-4">
          <div className={`mr-3 w-14 h-14 rounded-full flex items-center justify-center ${kpiColor}`}>
            <span className="font-bold">{Math.round(metrics.kpi)}%</span>
          </div>
          <div>
            <p className="font-medium">KPI отдела</p>
            <p className="text-gray-500 text-sm">{metrics.employeeCount} сотрудников</p>
          </div>
        </div>
        
        <hr className="my-4" />
        
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 text-sm">Производительность</span>
            <span className="text-sm">{Math.round(metrics.performance)}%</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 text-sm">Качество</span>
            <span className="text-sm">{Math.round(metrics.quality)}%</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 text-sm">Своевременность</span>
            <span className="text-sm">{Math.round(metrics.timeliness)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Основной компонент дашборда владельца бизнеса
const BusinessOwnerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');
  const [businessMetrics, setBusinessMetrics] = useState(null);
  
  // Цвета для графиков
  const chartColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#06B6D4'
  ];
  
  useEffect(() => {
    const fetchBusinessMetrics = async () => {
      try {
        setLoading(true);
        // В реальном приложении здесь будет запрос к API
        // const response = await fetch(`/api/metrics/business?period=${period}`);
        // const data = await response.json();
        
        // Временные данные для примера
        setTimeout(() => {
          const mockData = {
            summaryMetrics: {
              revenue: { value: '₽ 5,632,420', trend: 12.3 },
              ordersCount: { value: '2,145', trend: 8.7 },
              averageCheck: { value: '₽ 2,625', trend: 3.4 },
              profitMargin: { value: '24.5%', trend: -1.2 }
            },
            departmentMetrics: {
              sales: { 
                kpi: 83, 
                performance: 87, 
                quality: 79, 
                timeliness: 85,
                employeeCount: 12,
                topPerformer: 'Иванов И.И.'
              },
              accounting: { 
                kpi: 76, 
                performance: 74, 
                quality: 82, 
                timeliness: 72,
                employeeCount: 8,
                topPerformer: 'Петрова А.С.'
              },
              logistics: { 
                kpi: 69, 
                performance: 72, 
                quality: 68, 
                timeliness: 65,
                employeeCount: 15,
                topPerformer: 'Сидоров К.В.'
              }
            },
            orderStatusMetrics: [
              { name: 'Новые', value: 127 },
              { name: 'На проверке', value: 58 },
              { name: 'Ожидают оплаты', value: 184 },
              { name: 'Оплачены', value: 95 },
              { name: 'В обработке', value: 76 },
              { name: 'Отгружены', value: 112 },
              { name: 'Доставлены', value: 42 },
              { name: 'Завершены', value: 143 },
              { name: 'Отклонены', value: 8 }
            ],
            orderTrendData: [
              { month: 'Янв', sales: 2400, accounting: 1600, logistics: 2000 },
              { month: 'Фев', sales: 3100, accounting: 1900, logistics: 2500 },
              { month: 'Мар', sales: 2800, accounting: 2100, logistics: 2300 },
              { month: 'Апр', sales: 2700, accounting: 2300, logistics: 2100 },
              { month: 'Май', sales: 3200, accounting: 2500, logistics: 2400 },
              { month: 'Июн', sales: 3500, accounting: 2700, logistics: 2800 },
              { month: 'Июл', sales: 3300, accounting: 2800, logistics: 2600 },
              { month: 'Авг', sales: 3700, accounting: 3000, logistics: 2900 },
              { month: 'Сен', sales: 4000, accounting: 3200, logistics: 3100 },
              { month: 'Окт', sales: 4200, accounting: 3400, logistics: 3300 },
              { month: 'Ноя', sales: 4500, accounting: 3600, logistics: 3600 },
              { month: 'Дек', sales: 4800, accounting: 3900, logistics: 3800 }
            ],
            topEmployees: [
              { id: 1, name: 'Иванов И.И.', department: 'sales', kpi: 94, performance: 97, quality: 92 },
              { id: 2, name: 'Петрова А.С.', department: 'accounting', kpi: 91, performance: 89, quality: 95 },
              { id: 3, name: 'Сидоров К.В.', department: 'logistics', kpi: 88, performance: 91, quality: 86 },
              { id: 4, name: 'Смирнова О.Д.', department: 'sales', kpi: 87, performance: 88, quality: 89 },
              { id: 5, name: 'Козлов А.А.', department: 'logistics', kpi: 85, performance: 87, quality: 84 }
            ],
            processEfficiency: [
              { process: 'Обработка заказа', target: 24, actual: 22, unit: 'ч' },
              { process: 'Выставление счета', target: 4, actual: 3.2, unit: 'ч' },
              { process: 'Подтверждение оплаты', target: 8, actual: 6.5, unit: 'ч' },
              { process: 'Комплектация', target: 12, actual: 10.8, unit: 'ч' },
              { process: 'Доставка', target: 72, actual: 68.4, unit: 'ч' }
            ]
          };
          
          setBusinessMetrics(mockData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching business metrics:', err);
        setError('Не удалось загрузить метрики бизнеса');
        setLoading(false);
      }
    };
    
    fetchBusinessMetrics();
  }, [period]);
  
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
</div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      {/* Период и фильтры */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Общая эффективность бизнеса</h1>
        <div>
          <button 
            className={`px-4 py-2 mr-2 rounded ${period === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handlePeriodChange('week')}
          >
            Неделя
          </button>
          <button 
            className={`px-4 py-2 mr-2 rounded ${period === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handlePeriodChange('month')}
          >
            Месяц
          </button>
          <button 
            className={`px-4 py-2 rounded ${period === 'quarter' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handlePeriodChange('quarter')}
          >
            Квартал
          </button>
        </div>
      </div>
      
      {/* Основные показатели */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <MetricCard 
          title="Общая выручка" 
          value={businessMetrics.summaryMetrics.revenue.value}
          icon="₽"
          trend={businessMetrics.summaryMetrics.revenue.trend}
          color="bg-blue-100 text-blue-600"
        />
        <MetricCard 
          title="Количество заказов" 
          value={businessMetrics.summaryMetrics.ordersCount.value}
          icon="📦"
          trend={businessMetrics.summaryMetrics.ordersCount.trend}
          color="bg-cyan-100 text-cyan-600"
        />
        <MetricCard 
          title="Средний чек" 
          value={businessMetrics.summaryMetrics.averageCheck.value}
          icon="🧾"
          trend={businessMetrics.summaryMetrics.averageCheck.trend}
          color="bg-amber-100 text-amber-600"
        />
        <MetricCard 
          title="Маржинальность" 
          value={businessMetrics.summaryMetrics.profitMargin.value}
          icon="%"
          trend={businessMetrics.summaryMetrics.profitMargin.trend}
          color="bg-green-100 text-green-600"
        />
      </div>
      
      {/* Показатели отделов */}
      <h2 className="text-xl font-semibold mb-4">Производительность отделов</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <DepartmentPerformanceCard 
          department="Отдел продаж" 
          metrics={businessMetrics.departmentMetrics.sales}
        />
        <DepartmentPerformanceCard 
          department="Бухгалтерия" 
          metrics={businessMetrics.departmentMetrics.accounting}
        />
        <DepartmentPerformanceCard 
          department="Отдел логистики" 
          metrics={businessMetrics.departmentMetrics.logistics}
        />
      </div>
      
      {/* Графики и диаграммы */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="md:col-span-3 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Производительность отделов</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={businessMetrics.orderTrendData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sales" 
                name="Отдел продаж" 
                stroke="#3B82F6" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="accounting" 
                name="Бухгалтерия" 
                stroke="#10B981"
              />
              <Line 
                type="monotone" 
                dataKey="logistics" 
                name="Отдел логистики" 
                stroke="#F59E0B"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Статусы заказов</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={businessMetrics.orderStatusMetrics}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {businessMetrics.orderStatusMetrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} заказов`, 'Количество']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Топ сотрудников и эффективность процессов */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Топ сотрудников по KPI</h3>
            <button className="text-blue-500 text-sm flex items-center">
              Все сотрудники <span className="ml-1">→</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сотрудник
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Отдел
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KPI
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Производительность
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Качество
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {businessMetrics.topEmployees.map((employee) => {
                  // Функция для определения цвета отдела
                  const getDepartmentColor = (dept) => {
                    const deptColors = {
                      sales: 'bg-blue-100 text-blue-800',
                      accounting: 'bg-green-100 text-green-800',
                      logistics: 'bg-amber-100 text-amber-800'
                    };
                    return deptColors[dept] || 'bg-gray-100 text-gray-800';
                  };
                  
                  // Функция для получения названия отдела
                  const getDepartmentName = (dept) => {
                    const deptNames = {
                      sales: 'Продажи',
                      accounting: 'Бухгалтерия',
                      logistics: 'Логистика'
                    };
                    return deptNames[dept] || dept;
                  };
                  
                  // Функция для определения цвета KPI
                  const getKpiColor = (kpi) => {
                    if (kpi >= 90) return 'text-green-600';
                    if (kpi >= 80) return 'text-blue-600';
                    return 'text-amber-600';
                  };
                  
                  return (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {employee.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDepartmentColor(employee.department)}`}>
                          {getDepartmentName(employee.department)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`font-semibold ${getKpiColor(employee.kpi)}`}>
                          {employee.kpi}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        {employee.performance}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        {employee.quality}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Эффективность бизнес-процессов</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              layout="vertical"
              data={businessMetrics.processEfficiency}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="process" type="category" />
              <Tooltip formatter={(value, name, props) => [
                `${value} ${props.payload.unit || 'ч'}`,
                name === 'target' ? 'Целевое время' : 'Фактическое время'
              ]} />
              <Legend />
              <Bar dataKey="target" name="Целевое время" fill="#3B82F6" />
              <Bar dataKey="actual" name="Фактическое время" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BusinessOwnerDashboard;