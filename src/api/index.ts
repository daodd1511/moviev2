import axios, { AxiosInstance } from 'axios';

import { API_CONFIG } from './config';

export const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.apiUrl,
  params: {
    api_key: API_CONFIG.apiKey,
  },
});

export const backendApi: AxiosInstance = axios.create({
  baseURL: API_CONFIG.backendUrl,
});

export const videoApi: AxiosInstance = axios.create({
  baseURL: API_CONFIG.videoApiUrl,
});
