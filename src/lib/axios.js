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
      url: error.config?.url,
    });

    throw new Error(error.response?.data?.message || 'Something went wrong!');
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
    me: `${BASE_API_URL}/api/auth/me`,
    login: `${BASE_API_URL}/api/auth/login`,              // Changed from sign-in
    register: `${BASE_API_URL}/api/auth/register`,        // Changed from sign-up
    verifyEmail: (token) => `${BASE_API_URL}/api/auth/verify-email/${token}`,
    forgotPassword: `${BASE_API_URL}/api/auth/forgot-password`,  // Added
    resetPassword: `${BASE_API_URL}/api/auth/reset-password`,    // Added
    logout: `${BASE_API_URL}/api/auth/logout`,                   // Added
    refreshToken: `${BASE_API_URL}/api/auth/refresh-token`       // Added
  },

  company: {
    list: `${BASE_API_URL}/api/companies`,
    create: `${BASE_API_URL}/api/companies`,
    checkBin: (bin) => `${BASE_API_URL}/api/companies/check-bin/${bin}`,
    search: `${BASE_API_URL}/api/companies/search`
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
    list: `${BASE_API_URL}/api/product/`,
    details: (id) => `${BASE_API_URL}/api/product/details/${id}`,
    create: `${BASE_API_URL}/api/product`,  // Changed
    update: (id) => `${BASE_API_URL}/api/product/${id}`,  // Changed
    delete: (id) => `${BASE_API_URL}/api/product/${id}`,  // Changed
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
    list: `${BASE_API_URL}/api/invoices`,
    details: (id) => `${BASE_API_URL}/api/invoices/${id}`,
    create: `${BASE_API_URL}/api/invoices`,
    update: (id) => `${BASE_API_URL}/api/invoices/${id}`,
    delete: (id) => `${BASE_API_URL}/api/invoices/${id}`,
    updateStatus: (id, status) => `${BASE_API_URL}/api/invoices/${id}/status/${status}`,
    send: (id) => `${BASE_API_URL}/api/invoices/${id}/send`,
  },

  // Клиенты (customers)
  customer: {
    list: `${BASE_API_URL}/api/customers`,          // GET /api/customers
    details: (id) => `${BASE_API_URL}/api/customers/${id}`, // GET /api/customers/:id
    create: `${BASE_API_URL}/api/customers`,        // POST
    update: (id) => `${BASE_API_URL}/api/customers/${id}`,  // PUT /api/customers/:id
    delete: (id) => `${BASE_API_URL}/api/customers/${id}`,  // DELETE /api/customers/:id
  },

  supplier: {
    list: `${BASE_API_URL}/api/suppliers`,          // GET /api/customers
    details: `${BASE_API_URL}/api/suppliers/`, // GET /api/customers/:id
    create: `${BASE_API_URL}/api/suppliers`,        // POST
    update:`${BASE_API_URL}/api/suppliers/`,  // PUT /api/customers/:id
    delete: `${BASE_API_URL}/api/suppliers/`,  // DELETE /api/customers/:id
  },


};