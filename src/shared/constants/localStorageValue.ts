const isProduction = import.meta.env.VITE_APP_IS_PRODUCTION;

export const LOCAL_STORAGE_KEY = {
  watchTV: isProduction ? 'watchTV' : 'watchTV-dev',
};

// Path: src\shared\constants\localStorageValue.ts
