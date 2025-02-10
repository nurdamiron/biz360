import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export const CONFIG = {
  appName: 'BIZ360',
  appVersion: packageJson.version,
  serverUrl: import.meta.env.VITE_SERVER_URL ?? 'http://localhost:5000',
  assetsDir: import.meta.env.VITE_ASSETS_DIR ?? '',
  /**
   * Auth
   * @method jwt
   */
  auth: {
    method: 'jwt',
    skip: false,
    redirectPath: paths.dashboard.general.file,
  },
  /**
   * Mapbox
   */
  mapboxApiKey: import.meta.env.VITE_MAPBOX_API_KEY ?? '',

};
