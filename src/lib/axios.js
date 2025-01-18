import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    return Promise.reject((error.response && error.response.data) || 'Something went wrong!')
  }
);

// ----------------------------------------------------------------------

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

const BASE_API_URL = 'https://biz360-backend.onrender.com';

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  
  // Авторизация
  auth: {
    me: '/api/auth/me',
    signIn: `${BASE_API_URL}/api/auth/sign-in`,
    signUp: `${BASE_API_URL}/api/auth/sign-up`,
    verifyEmail: (token) => `${BASE_API_URL}/api/auth/verify-email/${token}`
  },

  // Почта
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels'
  },
  // Посты (блог / новости)
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  // Товары (product)
  product: {
    list: `${BASE_API_URL}/api/product/list`,
    details: `${BASE_API_URL}/api/product/details`,
    search: `${BASE_API_URL}/api/product/search`,
  },
  // Сотрудники (employee)
  employee: {
    list: `${BASE_API_URL}/api/employees`,
    details: (id) => `${BASE_API_URL}/api/employees/${id}`,
    create: `${BASE_API_URL}/api/employees`,
    update: (id) => `${BASE_API_URL}/api/employees/${id}`,
    delete: (id) => `${BASE_API_URL}/api/employees/${id}`,
  },

  order: {
    list: `${BASE_API_URL}/api/orders`,          // GET /api/orders
    details: (id) => `${BASE_API_URL}/api/orders/${id}`, // GET /api/orders/:id
    create: `${BASE_API_URL}/api/orders`,        // POST
    update: (id) => `${BASE_API_URL}/api/orders/${id}`,  // PUT
    delete: (id) => `${BASE_API_URL}/api/orders/${id}`,  // DELETE
  },

  // Счета (invoices)
  invoice: {
    list: `${BASE_API_URL}/api/invoices`,         // GET /api/invoices
    details: (id) => `${BASE_API_URL}/api/invoices/${id}`,
    create: `${BASE_API_URL}/api/invoices`,
    update: (id) => `${BASE_API_URL}/api/invoices/${id}`,
    delete: (id) => `${BASE_API_URL}/api/invoices/${id}`,
  },

  // Клиенты (customers)
  customer: {
    list: `${BASE_API_URL}/api/customers`,          // GET /api/customers
    details: (id) => `${BASE_API_URL}/api/customers/${id}`, // GET /api/customers/:id
    create: `${BASE_API_URL}/api/customers`,        // POST
    update: (id) => `${BASE_API_URL}/api/customers/${id}`,  // PUT /api/customers/:id
    delete: (id) => `${BASE_API_URL}/api/customers/${id}`,  // DELETE /api/customers/:id
  },


};