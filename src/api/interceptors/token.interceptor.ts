
import { AxiosRequestConfig } from 'axios';

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
