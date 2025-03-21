// src/routes/paths.js
import { kebabCase } from 'es-toolkit';

import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  components: '/components',
  figmaUrl: 'https://www.figma.com/design/cAPz4pYPtQEXivqe11EcDE/%5BPreview%5D-Minimal-Web.v6.0.0',
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id) => `/product/${id}`,
    demo: { details: `/product/${MOCK_ID}` },
  },
  post: {
    root: `/post`,
    details: (title) => `/post/${kebabCase(title)}`,
    demo: { details: `/post/${kebabCase(MOCK_TITLE)}` },
  },
  // AUTH
  auth: {
  
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
      verify: `${ROOTS.AUTH}/jwt/verify-email`,
      resetPassword: `${ROOTS.AUTH}/jwt/reset-password`,
    },
  },
  // authDemo: {
  //   split: {
  //     signIn: `${ROOTS.AUTH_DEMO}/split/sign-in`,
  //     signUp: `${ROOTS.AUTH_DEMO}/split/sign-up`,
  //     resetPassword: `${ROOTS.AUTH_DEMO}/split/reset-password`,
  //     updatePassword: `${ROOTS.AUTH_DEMO}/split/update-password`,
  //     verify: `${ROOTS.AUTH_DEMO}/split/verify`,
  //   },
  //   centered: {
  //     signIn: `${ROOTS.AUTH_DEMO}/centered/sign-in`,
  //     signUp: `${ROOTS.AUTH_DEMO}/centered/sign-up`,
  //     resetPassword: `${ROOTS.AUTH_DEMO}/centered/reset-password`,
  //     updatePassword: `${ROOTS.AUTH_DEMO}/centered/update-password`,
  //     verify: `${ROOTS.AUTH_DEMO}/centered/verify`,
  //   },
  // },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    mail: `${ROOTS.DASHBOARD}/mail`,
    chat: `${ROOTS.DASHBOARD}/chat`,
    blank: `${ROOTS.DASHBOARD}/blank`,
    kanban: `${ROOTS.DASHBOARD}/kanban`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    fileManager: `${ROOTS.DASHBOARD}/file-manager`,
    permission: `${ROOTS.DASHBOARD}/permission`,
    departmentRoutes: {
      sales: {
        employee: (id) => `/dashboard/sales/employee/${id}`,
      },
      accounting: {
        employee: (id) => `/dashboard/accounting/employee/${id}`,
      },
      logistics: {
        employee: (id) => `/dashboard/logistics/employee/${id}`,
      },
      manufacture: {
        employee: (id) => `/dashboard/manufacture/employee/${id}`,
      }
    },
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      banking: `${ROOTS.DASHBOARD}/banking`,
      booking: `${ROOTS.DASHBOARD}/booking`,
      file: `${ROOTS.DASHBOARD}/file`,
      course: `${ROOTS.DASHBOARD}/course`,
    },
    sales: {
      root: `${ROOTS.DASHBOARD}/sales`,
      clients: `${ROOTS.DASHBOARD}/sales/clients`,
      client: (id) => `${ROOTS.DASHBOARD}/sales/client/${id}`,
      development: `${ROOTS.DASHBOARD}/sales/development`,
      bonuses: `${ROOTS.DASHBOARD}/sales/bonuses`,
      leads: `${ROOTS.DASHBOARD}/sales/leads`,
      leadsDistribution: `${ROOTS.DASHBOARD}/sales/leads-distribution`,
    },
    employee: {
      root: `${ROOTS.DASHBOARD}/employee`,
      new: `${ROOTS.DASHBOARD}/employee/new`,
      list: `${ROOTS.DASHBOARD}/employee/list`,
      cards: `${ROOTS.DASHBOARD}/employee/cards`,
      profile: `${ROOTS.DASHBOARD}/employee/profile`,
      account: `${ROOTS.DASHBOARD}/employee/account`,
      edit: (id) => `${ROOTS.DASHBOARD}/employee/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/employee/${MOCK_ID}/edit`,
      },
    },
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/product/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/product/${MOCK_ID}/edit`,
      },
    },
    invoice: {
      root: `${ROOTS.DASHBOARD}/invoice`,
      new: `${ROOTS.DASHBOARD}/invoice/new`,
      details: (id) => `${ROOTS.DASHBOARD}/invoice/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/invoice/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}/edit`,
      },
    },
    post: {
      root: `${ROOTS.DASHBOARD}/post`,
      new: `${ROOTS.DASHBOARD}/post/new`,
      details: (title) => `${ROOTS.DASHBOARD}/post/${kebabCase(title)}`,
      edit: (title) => `${ROOTS.DASHBOARD}/post/${kebabCase(title)}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/post/${kebabCase(MOCK_TITLE)}`,
        edit: `${ROOTS.DASHBOARD}/post/${kebabCase(MOCK_TITLE)}/edit`,
      },
    },
    order: {
      root: `${ROOTS.DASHBOARD}/order`,
      list: `${ROOTS.DASHBOARD}/order/list`,
      new: `${ROOTS.DASHBOARD}/order/new`,
      details: (id) => `${ROOTS.DASHBOARD}/order/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/order/${id}/edit`,
    },
    job: {
      root: `${ROOTS.DASHBOARD}/job`,
      new: `${ROOTS.DASHBOARD}/job/new`,
      details: (id) => `${ROOTS.DASHBOARD}/job/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/job/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/job/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/job/${MOCK_ID}/edit`,
      },
    },
    tour: {
      root: `${ROOTS.DASHBOARD}/tour`,
      new: `${ROOTS.DASHBOARD}/tour/new`,
      details: (id) => `${ROOTS.DASHBOARD}/tour/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/tour/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}/edit`,
      },
    },
    metrics: {
      root: '/dashboard/metrics',
      business: '/dashboard/metrics/business',
      employee: (id) => `/dashboard/metrics/employee/${id}`,
      department: (code) => `/dashboard/metrics/department/${code}`,
    },
    notifications: '/dashboard/notifications',
  },
};
