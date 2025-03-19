// src/layouts/dashboard/config-navigation.js
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
  
  // 1. Общий Дашборд - только для админов и руководителей отделов
  if (isAdminUser || isHeadUser) {
    analysisSections.push({ 
      title: 'Общий Дашборд', 
      path: paths.dashboard.root, 
      icon: ICONS.dashboard 
    });
  }
  
  // 2. Продажи - только для отдела продаж и админов
  // if (isAdminUser || department === 'sales') {
  //   analysisSections.push({ 
  //     title: 'Продажи', 
  //     path: paths.dashboard.general.ecommerce, 
  //     icon: ICONS.ecommerce 
  //   });
  // }
  
  // 3. Бухгалтерия - только для отдела бухгалтерии и админов
  // if (isAdminUser || (department === 'accounting' && !isSalesEmployee)) {
  //   analysisSections.push({ 
  //     title: 'Бухгалтерия', 
  //     path: paths.dashboard.general.banking, 
  //     icon: ICONS.banking 
  //   });
  // }
  
  // // 4. Логистика - только для отдела логистики и админов
  // if (isAdminUser || (department === 'logistics' && !isSalesEmployee)) {
  //   analysisSections.push({ 
  //     title: 'Логистика', 
  //     path: paths.dashboard.general.course, 
  //     icon: ICONS.course 
  //   });
  // }
  
  // // 5. Производство - только для отдела производства и админов
  // if (isAdminUser || (department === 'manufacture' && !isSalesEmployee)) {
  //   analysisSections.push({ 
  //     title: 'Производство', 
  //     path: paths.dashboard.general.file, 
  //     icon: ICONS.file 
  //   });
  // }
  
  // Элементы подменю метрик
  const metricsChildren = [
    // Свои метрики видят все
    { title: 'Мои показатели', path: paths.dashboard.metrics.employee('me') }
  ];
  
  // Метрики отделов - показываем только метрики своего отдела
  if (isAdminUser || department === 'sales') {
    metricsChildren.push({ 
      title: 'Метрики отдела продаж', 
      path: paths.dashboard.metrics.department('sales') 
    });
  }
  
  // Другие отделы видны только админам и руководителям
  if (isAdminUser || (department === 'accounting' && !isSalesEmployee)) {
    metricsChildren.push({ 
      title: 'Метрики бухгалтерии', 
      path: paths.dashboard.metrics.department('accounting') 
    });
  }
  
  if (isAdminUser || (department === 'manufacture' && !isSalesEmployee)) {
    metricsChildren.push({ 
      title: 'Метрики производства', 
      path: paths.dashboard.metrics.department('manufacture') 
    });
  }
  
  if (isAdminUser || (department === 'logistics' && !isSalesEmployee)) {
    metricsChildren.push({ 
      title: 'Метрики логистики', 
      path: paths.dashboard.metrics.department('logistics') 
    });
  }
  
  // Добавляем раздел метрик, если есть дочерние элементы
  if (metricsChildren.length > 0) {
    analysisSections.push({
      title: 'Показатели',
      path: paths.dashboard.metrics.root,
      icon: ICONS.analytics,
      children: metricsChildren
    });
  }
  
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
      subheader: 'Анализ',
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

// Экспортируем полную навигацию для администраторов (для совместимости)
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
          { title: 'Мои показатели', path: paths.dashboard.metrics.employee('me') },
          { title: 'Показатели отдела продаж', path: paths.dashboard.metrics.department('sales') },
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