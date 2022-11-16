/* eslint-disable jsdoc/require-jsdoc */
// / <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_API_BASE_URL: string;
  readonly VITE_APP_API_KEY: string;
  readonly VITE_APP_VIDEO_API_KEY: string;
  readonly VITE_APP_IS_PRODUCTION: boolean;
  readonly VITE_APP_BACKEND_API_URL: string;

  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
