import { AxiosError, AxiosRequestConfig } from 'axios';

import { TokenService } from '../services/tokenService';

const LOGIN_ROUTE = '/auth/login';

/**
 * Intercept and add bearer authorization.
 * @param config Axios Request Config.
 */
export function tokenInterceptor(config: AxiosRequestConfig): AxiosRequestConfig {
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
  const requestPath = config.url?.replace(/^\/+/, '');
  return requestPath?.startsWith('auth/') === false;
}

/**
 * Clear token and redirect to login if a request is unauthorized.
 * @param error Axios Error.
 */
export function tokenErrorInterceptor(error: AxiosError): Promise<never> {
  if (error.response?.status === 401) {
    TokenService.destroy();

    const hashRoute = window.location.hash.slice(1);
    const currentRoute = hashRoute !== '' ? hashRoute : '/';
    const isLoginRoute = currentRoute.startsWith(LOGIN_ROUTE);

    if (!isLoginRoute) {
      const searchParams = new URLSearchParams({
        redirect: currentRoute,
      });
      const loginUrl = new URL(window.location.href);
      loginUrl.hash = `${LOGIN_ROUTE}?${searchParams.toString()}`;
      window.location.replace(loginUrl);
    }
  }
  return Promise.reject(error);
}
