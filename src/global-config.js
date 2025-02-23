// src/global-config.js
import { paths } from 'src/routes/paths';
import packageJson from '../package.json';

export const CONFIG = {
  appName: 'BIZ360',
  appVersion: packageJson.version,
  serverUrl: import.meta.env.VITE_SERVER_URL ?? 'http://localhost:5000',
  assetsDir: import.meta.env.VITE_ASSETS_DIR ?? '',
  
  auth: {
    method: 'jwt',
    skip: false,

    departments: {
      sales: {
        label: 'Отдел продаж',
        defaultPath: paths.dashboard.general.ecommerce,
        features: ['orders', 'products', 'customers']
      },
      accounting: {
        label: 'Бухгалтерия',
        defaultPath: paths.dashboard.general.banking,
        features: ['invoices', 'payments']
      },
      logistics: {
        label: 'Логистика',
        defaultPath: paths.dashboard.general.analytics,
        features: ['shipping', 'warehouse']
      },
      manufacture: {
        label: 'Производство',
        defaultPath: paths.dashboard.general.course,
        features: ['production', 'quality']
      }
    },

    roles: {
      owner: {
        level: 1,
        defaultPath: paths.dashboard.root,
        access: 'all'
      },
      admin: {
        level: 2,
        defaultPath: paths.dashboard.root,
        access: 'all'
      },
      manager: {
        level: 3,
        defaultPath: (dept) => CONFIG.auth.departments[dept]?.defaultPath || paths.dashboard.root,
        access: 'department'
      },
      employee: {
        level: 4,
        defaultPath: (dept) => CONFIG.auth.departments[dept]?.defaultPath || paths.dashboard.root,
        access: 'department'
      }
    }
  },

  mapboxApiKey: import.meta.env.VITE_MAPBOX_API_KEY ?? ''
};