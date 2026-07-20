
import { AxiosError, AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

import { TokenService } from '../services/tokenService';

/**
 * Intercept and add bearer authorization.
 * @param config Axios Request Config.
 */
export function tokenInterceptor(
  config: AxiosRequestConfig,
): AxiosRequestConfig {
  if (!shouldInterceptWithToken(config)) {
    return config;
  }
  const token = TokenService.get();
  if (token === null) {
    return config;
  }
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    },
  };
}

/**
 * Should intercept with token.
 * @param config Axios Request Config.
 */
export function shouldInterceptWithToken(config: AxiosRequestConfig): boolean {
  return config.url?.startsWith('/auth') === false;
}

/**
 * Clear token and redirect to login if get 4** error.
 * @param error Axios Error.
 * @param router Router.
 */
export function tokenErrorInterceptor(
  error: AxiosError,
): Promise<never> {
  if (error.response?.status === 401) {
    TokenService.destroy();
    window.location.replace('/login');
  }
  return Promise.reject(error);
}
