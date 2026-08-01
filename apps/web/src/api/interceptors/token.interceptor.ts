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
 * @param redirectTo Performs the redirect; defaults to a real navigation. Overridable in
 * tests so they don't have to stub `window.location` — assigning to it invokes jsdom's
 * real navigation setter, which is flaky to reset between test files.
 */
export function tokenErrorInterceptor(
  error: AxiosError,
  redirectTo: (url: string) => void = url => window.location.replace(url),
): Promise<never> {
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
      redirectTo(loginUrl.toString());
    }
  }
  return Promise.reject(error);
}
