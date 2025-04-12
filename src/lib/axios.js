// src/lib/axios.js
import axios from 'axios';
import { CONFIG } from 'src/global-config';
import { getAccessToken, getRefreshToken, setSession, removeSession } from 'src/auth/context/jwt/utils';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

const BASE_API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000'  // <-- Локальный бэкенд
  : CONFIG.apiUrl || 'https://biz360-backend.onrender.com';

// Создаем axios инстанс
const axiosInstance = axios.create({ 
  baseURL: BASE_API_URL
});

// Очередь запросов, ожидающих обновления токена
let refreshTokenPromise = null;
let pendingRequests = [];

// Добавление токена Authorization к каждому запросу
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Обработка ответов и автоматическое обновление токена при 401 ошибке
axiosInstance.interceptors.response.use(
  // Успешный ответ
  (response) => response,
  
  // Обработка ошибок
  async (error) => {
    const originalRequest = error.config;
    
    // Логируем ошибку для отладки
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: originalRequest?.url,
    });
    
    // Обработка ошибки 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Проверяем наличие refresh token
      const refreshToken = getRefreshToken();
      
      // Если refresh token отсутствует, перенаправляем на страницу входа
      if (!refreshToken) {
        removeSession();
        window.location.href = paths.auth.jwt.signIn;
        return Promise.reject(error);
      }
      
      // Помечаем запрос, чтобы избежать бесконечного цикла
      originalRequest._retry = true;
      
      // Если процесс обновления токена уже запущен, добавляем запрос в очередь
      if (refreshTokenPromise) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject, originalRequest });
        });
      }
      
      // Запускаем процесс обновления токена
      refreshTokenPromise = (async () => {
        try {
          // Отправляем запрос на обновление токена
          const response = await axios.post(`${BASE_API_URL}/api/auth/refresh-token`, {
            refreshToken
          });
          
          // Проверяем успешность запроса
          if (response.data.success && response.data.data.accessToken) {
            const { accessToken } = response.data.data;
            
            // Обновляем токен в сессии
            await setSession(accessToken, refreshToken);
            
            // Обновляем заголовок для текущего запроса
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            
            // Выполняем все отложенные запросы с новым токеном
            pendingRequests.forEach(({ resolve, reject, originalRequest: reqConfig }) => {
              reqConfig.headers.Authorization = `Bearer ${accessToken}`;
              axiosInstance(reqConfig).then(resolve).catch(reject);
            });
            pendingRequests = [];
            
            // Повторяем исходный запрос с новым токеном
            return axiosInstance(originalRequest);
          } else {
            // Если обновление токена не удалось, перенаправляем на страницу входа
            removeSession();
            window.location.href = paths.auth.jwt.signIn;
            throw new Error('Refresh token failed');
          }
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          
          // Отклоняем все отложенные запросы
          pendingRequests.forEach(({ reject }) => {
            reject(refreshError);
          });
          pendingRequests = [];
          
          // Удаляем токены и перенаправляем на страницу входа
          removeSession();
          window.location.href = paths.auth.jwt.signIn;
          throw refreshError;
        } finally {
          // Сбрасываем промис
          refreshTokenPromise = null;
        }
      })();
      
      return refreshTokenPromise;
    }
    
    // Обработка ошибки 403 (Forbidden) - нет прав доступа
    if (error.response?.status === 403) {
      console.error('Permission denied:', error.response.data);
      // Можно показать специальное сообщение или перенаправить на страницу с ошибкой 403
    }
    
    // Обработка ошибки 422 (Validation Error)
    if (error.response?.status === 422) {
      console.error('Validation error:', error.response.data);
      // Формируем понятное сообщение об ошибке валидации
      const validationErrors = error.response.data.errors || {};
      const messages = Object.values(validationErrors).flat();
      const errorMessage = messages.length > 0 
        ? messages.join(', ')
        : error.response.data.message || 'Validation failed';
      
      return Promise.reject(new Error(errorMessage));
    }
    
    // Обработка других ошибок
    const errorMessage = error.response?.data?.message || 'Something went wrong!';
    return Promise.reject(new Error(errorMessage));
  }
);

// ----------------------------------------------------------------------

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  return (await axiosInstance.get(url, { ...config })).data;
};

// ----------------------------------------------------------------------

// Эндпоинты API строго согласно документации
export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  
  // Авторизация - названия приведены в соответствие с документацией
  auth: {
    me: `${BASE_API_URL}/api/auth/me`,
    login: `${BASE_API_URL}/api/auth/login`,              // Вход в систему
    register: `${BASE_API_URL}/api/auth/register`,        // Регистрация
    verifyEmail: (token) => `${BASE_API_URL}/api/auth/verify-email/${token}`,
    forgotPassword: `${BASE_API_URL}/api/auth/forgot-password`,
    resetPassword: `${BASE_API_URL}/api/auth/reset-password`,
    logout: `${BASE_API_URL}/api/auth/logout`,
    refreshToken: `${BASE_API_URL}/api/auth/refresh-token`
  },

  company: {
    list: `${BASE_API_URL}/api/companies`,
    create: `${BASE_API_URL}/api/companies`,
    checkBin: (bin) => `${BASE_API_URL}/api/companies/check-bin/${bin}`,
    search: `${BASE_API_URL}/api/companies/search`
  },

  metrics: {
    employee: (id) => `${BASE_API_URL}/api/metrics/employee/${id}`,
    department: (department) => `${BASE_API_URL}/api/metrics/department/${department}`,
    order: (id) => `${BASE_API_URL}/api/orders/${id}/metrics`,
  },

  notifications: {
    list: `${BASE_API_URL}/api/notifications`,
    markAsRead: (id) => `${BASE_API_URL}/api/notifications/${id}/read`,
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
    create: `${BASE_API_URL}/api/product`,
    update: (id) => `${BASE_API_URL}/api/product/${id}`,
    delete: (id) => `${BASE_API_URL}/api/product/${id}`,
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

  // Заказы
  order: {
    list: `${BASE_API_URL}/api/orders`,
    details: (id) => `${BASE_API_URL}/api/orders/${id}`,
    create: `${BASE_API_URL}/api/orders`,
    update: (id) => `${BASE_API_URL}/api/orders/${id}`,
    delete: (id) => `${BASE_API_URL}/api/orders/${id}`,
    metrics: (id) => `${BASE_API_URL}/api/orders/${id}/metrics`,
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
    list: `${BASE_API_URL}/api/customers`,
    details: (id) => `${BASE_API_URL}/api/customers/${id}`,
    create: `${BASE_API_URL}/api/customers`,
    update: (id) => `${BASE_API_URL}/api/customers/${id}`,
    delete: (id) => `${BASE_API_URL}/api/customers/${id}`,
  },

  // Поставщики
  supplier: {
    list: `${BASE_API_URL}/api/suppliers`,
    details: (id) => `${BASE_API_URL}/api/suppliers/${id}`,
    create: `${BASE_API_URL}/api/suppliers`,
    update: (id) => `${BASE_API_URL}/api/suppliers/${id}`,
    delete: (id) => `${BASE_API_URL}/api/suppliers/${id}`,
  },

  // Задачи (согласно документации)
  tasks: {
    list: `${BASE_API_URL}/api/tasks`,
    my: `${BASE_API_URL}/api/tasks/my`,
    details: (id) => `${BASE_API_URL}/api/tasks/${id}`,
    create: `${BASE_API_URL}/api/tasks`,
    update: (id) => `${BASE_API_URL}/api/tasks/${id}`,
    delete: (id) => `${BASE_API_URL}/api/tasks/${id}`,
    updateStatus: (id) => `${BASE_API_URL}/api/tasks/${id}/status`,
    comments: (taskId) => `${BASE_API_URL}/api/tasks/${taskId}/comments`,
  },

  // Бонусная система (согласно документации)
  bonus: {
    schemes: `${BASE_API_URL}/api/bonus/schemes`,
    schemeDetails: (id) => `${BASE_API_URL}/api/bonus/schemes/${id}`,
    calculate: `${BASE_API_URL}/api/bonus/calculate`,
    assign: `${BASE_API_URL}/api/bonus/assign`,
    autoAssign: `${BASE_API_URL}/api/bonus/auto-assign`,
    list: `${BASE_API_URL}/api/bonus`,
    details: (id) => `${BASE_API_URL}/api/bonus/${id}`,
    updateStatus: (id) => `${BASE_API_URL}/api/bonus/${id}/status`,
    employeeBonuses: (employeeId) => `${BASE_API_URL}/api/bonus/employee/${employeeId}`,
    employeeStatistics: (employeeId) => `${BASE_API_URL}/api/bonus/employee/${employeeId}/statistics`,
    summary: `${BASE_API_URL}/api/bonus/summary/by-employee`,
  },

  // Документы и шаблоны (согласно документации)
  documents: {
    templates: {
      list: `${BASE_API_URL}/api/document-templates`,
      details: (id) => `${BASE_API_URL}/api/document-templates/${id}`,
      create: `${BASE_API_URL}/api/document-templates`,
      update: (id) => `${BASE_API_URL}/api/document-templates/${id}`,
      delete: (id) => `${BASE_API_URL}/api/document-templates/${id}`,
      generate: (id) => `${BASE_API_URL}/api/document-templates/${id}/generate`,
    },
    generated: {
      list: `${BASE_API_URL}/api/document-templates/generated`,
      details: (id) => `${BASE_API_URL}/api/document-templates/generated/${id}`,
      exportToPdf: (id) => `${BASE_API_URL}/api/document-templates/generated/${id}/export-pdf`,
    },
  },
};