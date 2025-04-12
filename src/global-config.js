// src/global-config.js
import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export const CONFIG = {
  appName: 'BIZ360',
  appVersion: packageJson.version,  
  apiUrl: import.meta.env.VITE_SERVER_URL ?? 'http://localhost:5000',
  assetsDir: import.meta.env.VITE_ASSETS_DIR ?? '',

  
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true' || true,
  
  /**
   * Auth
   * @method jwt
   */
  auth: {
    method: 'jwt',
    skip: false,
    redirectPath: paths.dashboard.root,
  },
  /**
   * Mapbox
   */
  mapboxApiKey: import.meta.env.VITE_MAPBOX_API_KEY ?? '',

};

export const USE_MOCK_DATA = CONFIG.useMockData;
export const API_URL = CONFIG.apiUrl;

// global-config.js
export const shouldUseMockData = () => {
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
};