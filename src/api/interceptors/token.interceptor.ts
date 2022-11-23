
import { AxiosRequestConfig } from 'axios';

import { TokenService } from '../services/tokenService';

/**
 * Intercept and add bearer authorization.
 * @param config Axios Request Config.
 */
export function tokenInterceptor(
  config: AxiosRequestConfig,
): AxiosRequestConfig {
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
