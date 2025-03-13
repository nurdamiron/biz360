// nav-config-dashboard.jsx
import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

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
};

// ----------------------------------------------------------------------

export const getFilteredNavData = (user) => {
  if (!user) return [];
  
  const { role, department } = user.employee || {};
  
  // For owner/admin, show everything
  const isAdmin = role === 'owner' || role === 'admin';
  
  // Base navigation structure
  const navData = [
    // Analysis section
    {
      subheader: 'Анализ',
      items: [
        // Only show general dashboard to admin/owner
        ...(isAdmin ? [{ title: 'Общий Дашборд', path: paths.dashboard.root, icon: ICONS.dashboard }] : []),
        
        // Department-specific dashboards based on user's department
        ...(isAdmin || department === 'sales' ? 
          [{ title: 'Продажи', path: paths.dashboard.general.ecommerce, icon: ICONS.ecommerce }] : []),
        
        ...(isAdmin || department === 'logistics' ? 
          [{ title: 'Логистика', path: paths.dashboard.general.course, icon: ICONS.course }] : []),
        
        ...(isAdmin || department === 'accounting' ? 
          [{ title: 'Бухгалтерия', path: paths.dashboard.general.banking, icon: ICONS.banking }] : []),
          
        ...(isAdmin || department === 'manufacture' ? 
          [{ title: 'Производство', path: paths.dashboard.general.file, icon: ICONS.file }] : []),
      ],
    },
    
    // Management section
    {
      subheader: 'Управление',
      items: [
        // Employees - only for admin/owner or department heads
        ...(isAdmin || role === 'head' ? [{
          title: 'Сотрудники',
          path: paths.dashboard.employee.list,
          icon: ICONS.employee,
        }] : []),
        
        // Products - for admin/owner, sales, manufacture
        ...((isAdmin || ['sales', 'manufacture'].includes(department)) ? [{
          title: 'Продукты',
          path: paths.dashboard.product.root,
          icon: ICONS.product,
        }] : []),
        
        // Orders - for admin/owner, sales, logistics
        ...((isAdmin || ['sales', 'logistics'].includes(department)) ? [{
          title: 'Заказы',
          path: paths.dashboard.order.root,
          icon: ICONS.order,
        }] : []),
        
        // Invoices - for admin/owner, accounting, sales
        ...((isAdmin || ['accounting', 'sales'].includes(department)) ? [{
          title: 'Бухгалтерия',
          path: paths.dashboard.invoice.root,
          icon: ICONS.invoice,
        }] : []),
        
        // File manager - for everyone
        // { title: 'Файловый менеджер', path: paths.dashboard.fileManager, icon: ICONS.folder },
        
        // Calendar - for everyone
        // { title: 'Календарь', path: paths.dashboard.calendar, icon: ICONS.calendar },
        
        // Kanban - for everyone
        // { title: 'Канбан', path: paths.dashboard.kanban, icon: ICONS.kanban },
      ],
    },
    
    // Tools section
    {
      subheader: 'Инструменты',
      items: [
        // Training - for everyone
        { title: 'Обучение', path: paths.dashboard.post.root, icon: ICONS.blog },
        
        // Jobs - visible to everyone
        { title: 'Вакансии', path: paths.dashboard.job.root, icon: ICONS.job },
      ],
    },
  ];
  
  // Filter out any sections that have no items
  return navData.filter(section => section.items.length > 0);
};

export const navData = [
  /**
   * Overview
   */
  {
    subheader: 'Анализ',
    items: [
      { title: 'Общий Дашборд', path: paths.dashboard.root, icon: ICONS.dashboard },
      // { title: 'Дашборд', path: paths.dashboard.root, icon: ICONS.dashboard },
      { title: 'Продажи', path: paths.dashboard.general.ecommerce, icon: ICONS.ecommerce },
      // { title: 'Продажи', path: paths.dashboard.general.analytics, icon: ICONS.analytics },
      // { title: 'Логистика', path: paths.dashboard.general.course, icon: ICONS.course },
      { title: 'Бухгалтерия', path: paths.dashboard.general.banking, icon: ICONS.banking },
      // { title: 'Booking', path: paths.dashboard.general.booking, icon: ICONS.booking },
      // { title: 'Booking', path: paths.dashboard.general.file, icon: ICONS.file },
      {
        title: 'Метрики',
        path: paths.dashboard.metrics.root,
        icon: ICONS.analytics,
        children: [
          { title: 'Моя эффективность', path: paths.dashboard.metrics.employee('me') },
          { title: 'Метрики отдела продаж', path: paths.dashboard.metrics.department('sales') },
          { title: 'Метрики бухгалтерии', path: paths.dashboard.metrics.department('accounting') },
          { title: 'Метрики логистики', path: paths.dashboard.metrics.department('logistics') },
        ],
      },
      // { title: 'Course', path: paths.dashboard.general.course, icon: ICONS.course },
    ],
  },
  /**
   * Management
   */
  {
    subheader: 'Управление',
    items: [
      {
        title: 'Сотрудники',
        path: paths.dashboard.employee.list,
        icon: ICONS.employee,
        // children: [
        //   // { title: 'Профиль', path: paths.dashboard.employee.root },
        //   // { title: 'Карточки', path: paths.dashboard.employee.cards },
        //   { title: 'Список', path: paths.dashboard.employee.list },
        //   // { title: 'Cоздать', path: paths.dashboard.employee.new },
        //   // { title: 'Изменить', path: paths.dashboard.employee.demo.edit },
        //   // { title: 'Настройка аккаунта', path: paths.dashboard.employee.account },
        // ],
      },
      {
        title: 'Продукты',
        path: paths.dashboard.product.root,
        icon: ICONS.product,
        // children: [
        //   { title: 'Список', path: paths.dashboard.product.root },
        //   { title: 'Детали', path: paths.dashboard.product.demo.details },
        //   { title: 'Создать', path: paths.dashboard.product.new },
        //   { title: 'Изменить', path: paths.dashboard.product.demo.edit },
        // ],
      },
      {
        title: 'Заказы',
        path: paths.dashboard.order.root,
        icon: ICONS.order,
        // children: [
        //   { title: 'Список', path: paths.dashboard.order.root },
        //   { title: 'Новый заказ', path: paths.dashboard.order.new },
        // ],
      },
      {
        title: 'Бухгалтерия',
        path: paths.dashboard.invoice.root,
        icon: ICONS.invoice,
        // children: [
        //   { title: 'List', path: paths.dashboard.invoice.root },
        //   { title: 'Details', path: paths.dashboard.invoice.demo.details },
        //   { title: 'Create', path: paths.dashboard.invoice.new },
        //   { title: 'Edit', path: paths.dashboard.invoice.demo.edit },
        // ],
      },
      {
        title: 'Уведомления',
        path: paths.dashboard.notifications,
        icon: 'mdi:bell',
      },
     
      // {
      //   title: 'Tour',
      //   path: paths.dashboard.tour.root,
      //   icon: ICONS.tour,
      //   children: [
      //     { title: 'List', path: paths.dashboard.tour.root },
      //     { title: 'Details', path: paths.dashboard.tour.demo.details },
      //     { title: 'Create', path: paths.dashboard.tour.new },
      //     { title: 'Edit', path: paths.dashboard.tour.demo.edit },
      //   ],
      // },
      // { title: 'Файловый менеджер', path: paths.dashboard.fileManager, icon: ICONS.folder },
      // {
      //   title: 'Mail',
      //   path: paths.dashboard.mail,
      //   icon: ICONS.mail,
      //   info: (
      //     <Label color="error" variant="inverted">
      //       +32
      //     </Label>
      //   ),
      // },
      // { title: 'Chat', path: paths.dashboard.chat, icon: ICONS.chat },
      // { title: 'Календарь', path: paths.dashboard.calendar, icon: ICONS.calendar },
      // { title: 'Канбан', path: paths.dashboard.kanban, icon: ICONS.kanban },
    ],
  },
  /**
   * Item State
   */
  // {
  //   subheader: 'Инструменты',
  //   items: [
      // {
      //   // default roles : All roles can see this entry.
      //   // roles: ['employee'] Only employees can see this item.
      //   // roles: ['admin'] Only admin can see this item.
      //   // roles: ['admin', 'manager'] Only admin/manager can see this item.
      //   // Reference from 'src/guards/RoleBasedGuard'.
      //   title: 'Permission',
      //   path: paths.dashboard.permission,
      //   icon: ICONS.lock,
      //   roles: ['employee', 'manager'],
      //   caption: 'Only admin can see this item',
      // },
      // {
      //   title: 'Обучение',
      //   path: paths.dashboard.post.root,
      //   icon: ICONS.blog,
        // children: [
        //   { title: 'List', path: paths.dashboard.post.root },
        //   { title: 'Details', path: paths.dashboard.post.demo.details },
        //   { title: 'Create', path: paths.dashboard.post.new },
        //   { title: 'Edit', path: paths.dashboard.post.demo.edit },
        // ],
      // },
      // {
      //   title: 'Вакансии',
      //   path: paths.dashboard.job.root,
      //   icon: ICONS.job,
        // children: [
        //   { title: 'List', path: paths.dashboard.job.root },
        //   { title: 'Details', path: paths.dashboard.job.demo.details },
        //   { title: 'Create', path: paths.dashboard.job.new },
        //   { title: 'Edit', path: paths.dashboard.job.demo.edit },
        // ],
      // },
      // {
      //   title: 'Level',
      //   path: '#/dashboard/menu_level',
      //   icon: ICONS.menuItem,
      //   children: [
      //     {
      //       title: 'Level 1a',
      //       path: '#/dashboard/menu_level/menu_level_1a',
      //       children: [
      //         { title: 'Level 2a', path: '#/dashboard/menu_level/menu_level_1a/menu_level_2a' },
      //         {
      //           title: 'Level 2b',
      //           path: '#/dashboard/menu_level/menu_level_1a/menu_level_2b',
      //           children: [
      //             {
      //               title: 'Level 3a',
      //               path: '#/dashboard/menu_level/menu_level_1a/menu_level_2b/menu_level_3a',
      //             },
      //             {
      //               title: 'Level 3b',
      //               path: '#/dashboard/menu_level/menu_level_1a/menu_level_2b/menu_level_3b',
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //     { title: 'Level 1b', path: '#/dashboard/menu_level/menu_level_1b' },
      //   ],
      // },
      // {
      //   title: 'Disabled',
      //   path: '#disabled',
      //   icon: ICONS.disabled,
      //   disabled: true,
      // },
      // {
      //   title: 'Label',
      //   path: '#label',
      //   icon: ICONS.label,
      //   info: (
      //     <Label
      //       color="info"
      //       variant="inverted"
      //       startIcon={<Iconify icon="solar:bell-bing-bold-duotone" />}
      //     >
      //       NEW
      //     </Label>
      //   ),
      // },
      // {
      //   title: 'Caption',
      //   path: '#caption',
      //   icon: ICONS.menuItem,
      //   caption:
      //     'Quisque malesuada placerat nisl. In hac habitasse platea dictumst. Cras id dui. Pellentesque commodo eros a enim. Morbi mollis tellus ac sapien.',
      // },
      // {
      //   title: 'Params',
      //   path: '/dashboard/params?id=e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1',
      //   icon: ICONS.parameter,
      // },
      // {
      //   title: 'External link',
      //   path: 'https://www.google.com/',
      //   icon: ICONS.external,
      //   info: <Iconify width={18} icon="prime:external-link" />,
      // },
      // { title: 'Blank', path: paths.dashboard.blank, icon: ICONS.blank },
  //   ],
  // },
];
