import axios from 'axios';
import { API_URL } from './api';
import { getData } from './storage';
import { STORAGE_KEYS } from './storage';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getData(STORAGE_KEYS.SESSION_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;