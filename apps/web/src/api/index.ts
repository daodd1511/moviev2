import axios, { AxiosInstance } from 'axios';

import { API_CONFIG } from './config';
import { tokenErrorInterceptor, tokenInterceptor } from './interceptors/token.interceptor';

export const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.apiUrl,
  params: {
    api_key: API_CONFIG.tmdbApiKey,
  },
});

export const backendApi: AxiosInstance = axios.create({
  baseURL: API_CONFIG.backendUrl,
});

backendApi.interceptors.request.use(
  config => tokenInterceptor(config), error => Promise.reject(error),
);

backendApi.interceptors.response.use(
  response => response, error => tokenErrorInterceptor(error),
);
