// src/layouts/dashboard/nav-config-dashboard.jsx
import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/global-config';
import { SvgColor } from 'src/components/svg-color';
import { 
  hasAccessToDepartment, 
  isAdmin, 
  isDepartmentHead, 
  canAccessFeature 
} from 'src/auth/utils';

// ----------------------------------------------------------------------
const icon = (name) => <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  employee: icon('ic-employee'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
  notifications: icon('ic-mail'),
  star: icon('ic-star'),  // Иконка для бонусов
  chart: icon('ic-chart'), // Иконка для плана развития
};

// ----------------------------------------------------------------------
// src/layouts/dashboard/config-navigation.js
export const getFilteredNavData = (user) => {
  console.log('getFilteredNavData - получены данные пользователя:', user);
  
  // Если пользователь не определен или нет данных employee, возвращаем полный набор
  if (!user) {
    console.log('getFilteredNavData - пользователь не определен, возвращаем полный набор');
    return navData;
  }
  
  // Получаем роль и отдел
  const role = user.role || 'employee';
  const department = user.department || 'sales';
  
  console.log('getFilteredNavData - роль:', role, 'отдел:', department);
  
  // Проверка роли и отдела
  const isAdminUser = role === 'admin' || role === 'owner';
  const isHeadUser = role === 'head';
  const isSalesEmployee = department === 'sales' && role === 'employee';
  
  // Набор разделов для анализа
  const analysisSections = [];
  
  // 1. Для обычного сотрудника отдела продаж - показываем пункты меню напрямую
  if (isSalesEmployee) {
    // Основные элементы навигации для сотрудника отдела продаж
    analysisSections.push({ 
      title: 'Мой дашборд', 
      path: paths.dashboard.departmentRoutes.sales.employee('me'), // Новый путь
      icon: ICONS.dashboard 
    });
    
    analysisSections.push({ 
      title: 'Мои клиенты', 
      path: paths.dashboard.sales.clients, 
      icon: ICONS.ecommerce 
    });
    
    analysisSections.push({ 
      title: 'План развития', 
      path: paths.dashboard.sales.development, 
      icon: ICONS.chart 
    });
    
    analysisSections.push({ 
      title: 'Мотивационная программа', 
      path: paths.dashboard.sales.bonuses, 
      icon: ICONS.star 
    });
  } 
  // 2. Для админов и руководителей - стандартная структура
  else {
    // Общий Дашборд - только для админов и руководителей отделов
    if (isAdminUser || isHeadUser) {
      analysisSections.push({ 
        title: 'Общий Дашборд', 
        path: paths.dashboard.root, 
        icon: ICONS.dashboard 
      });
    }
    
    // Если пользователь относится к отделу продаж или админ/руководитель
    if (isAdminUser || isHeadUser || department === 'sales') {
      analysisSections.push({
        title: 'Отдел продаж',
        path: paths.dashboard.sales.root,
        icon: ICONS.ecommerce,
        children: [
          { title: 'Мой дашборд', path: paths.dashboard.sales.root },
          { title: 'Мои клиенты', path: paths.dashboard.sales.clients },
          { title: 'План развития', path: paths.dashboard.sales.development },
          { title: 'Мотивационная программа', path: paths.dashboard.sales.bonuses }
        ]
      });
    }
    
    // Другие отделы - по необходимости можно добавить здесь
  }
  
  // ВАЖНО: Удаляем весь блок с метриками для обычных сотрудников отдела продаж
  // Если необходимо оставить метрики для администраторов и руководителей, то можно
  // использовать эту проверку: if (!isSalesEmployee) { ... }
  
  // Элементы для управления
  const managementItems = [];
  
  // Сотрудники - только для админов и руководителей
  if (isAdminUser || isHeadUser) {
    managementItems.push({
      title: 'Сотрудники',
      path: paths.dashboard.employee.list,
      icon: ICONS.employee,
    });
  }
  
  // Продукты - для определенных отделов и админов
  if (isAdminUser || ['sales', 'manufacture'].includes(department)) {
    managementItems.push({
      title: 'Продукты',
      path: paths.dashboard.product.root,
      icon: ICONS.product,
    });
  }
  
  // Заказы - для определенных отделов и админов
  if (isAdminUser || ['sales', 'logistics'].includes(department)) {
    managementItems.push({
      title: 'Заказы',
      path: paths.dashboard.order.root,
      icon: ICONS.order,
    });
  }
  
  // Бухгалтерия - для админов и руководителей отделов
  if (isAdminUser || isHeadUser || (department === 'accounting')) {
    managementItems.push({
      title: 'Бухгалтерия',
      path: paths.dashboard.invoice.root,
      icon: ICONS.invoice,
    });
  }
  
  // Уведомления - для всех пользователей
  managementItems.push({
    title: 'Уведомления',
    path: paths.dashboard.notifications,
    icon: ICONS.notifications,
  });
  
  // Генерируем финальную структуру навигации
  const navigations = [];
  
  // Добавляем раздел анализа, если в нем есть элементы
  if (analysisSections.length > 0) {
    navigations.push({
      subheader: isSalesEmployee ? 'Меню' : 'Анализ',
      items: analysisSections
    });
  }
  
  // Добавляем раздел управления, если в нем есть элементы
  if (managementItems.length > 0) {
    navigations.push({
      subheader: 'Управление',
      items: managementItems
    });
  }
  
  // Инструменты - определяем, какие показывать
  const toolItems = [];
  
  // Обучение доступно всем
  // toolItems.push({ title: 'Обучение', path: paths.dashboard.post.root, icon: ICONS.blog });
  
  // Вакансии доступны всем
  // toolItems.push({ title: 'Вакансии', path: paths.dashboard.job.root, icon: ICONS.job });
  
  // Добавляем раздел инструментов
  if (toolItems.length > 0) {
    navigations.push({
      subheader: 'Инструменты',
      items: toolItems
    });
  }
  
  console.log('getFilteredNavData - сформированная навигация:', navigations);
  return navigations;
};

// Полная навигация для администраторов (обновлено название метрик)
export const navData = [
  {
    subheader: 'Анализ',
    items: [
      { title: 'Общий Дашборд', path: paths.dashboard.root, icon: ICONS.dashboard },
      { title: 'Продажи', path: paths.dashboard.general.ecommerce, icon: ICONS.ecommerce },
      { title: 'Бухгалтерия', path: paths.dashboard.general.banking, icon: ICONS.banking },
      { title: 'Логистика', path: paths.dashboard.general.course, icon: ICONS.course },
      { title: 'Производство', path: paths.dashboard.general.file, icon: ICONS.file },
      {
        title: 'Показатели',
        path: paths.dashboard.metrics.root,
        icon: ICONS.analytics,
        children: [
          { title: 'Показатели отделов', path: paths.dashboard.metrics.department('sales') },
          { title: 'Метрики бухгалтерии', path: paths.dashboard.metrics.department('accounting') },
          { title: 'Метрики производства', path: paths.dashboard.metrics.department('manufacture') },
          { title: 'Метрики логистики', path: paths.dashboard.metrics.department('logistics') },
        ],
      },
    ],
  },
  {
    subheader: 'Управление',
    items: [
      {
        title: 'Сотрудники',
        path: paths.dashboard.employee.list,
        icon: ICONS.employee,
      },
      {
        title: 'Продукты',
        path: paths.dashboard.product.root,
        icon: ICONS.product,
      },
      {
        title: 'Заказы',
        path: paths.dashboard.order.root,
        icon: ICONS.order,
      },
      {
        title: 'Бухгалтерия',
        path: paths.dashboard.invoice.root,
        icon: ICONS.invoice,
      },
      {
        title: 'Уведомления',
        path: paths.dashboard.notifications,
        icon: ICONS.notifications,
      }
    ],
  },
  {
    subheader: 'Инструменты',
    items: [
      { title: 'Обучение', path: paths.dashboard.post.root, icon: ICONS.blog },
      { title: 'Вакансии', path: paths.dashboard.job.root, icon: ICONS.job },
    ]
  }
];