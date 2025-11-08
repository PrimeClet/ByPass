// src/api/axios.ts
import axios from 'axios';
import { store } from '@/store/store'; // ton Redux store


const api = axios.create({
  baseURL: 'http://127.0.0.1:8001/api',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
     "ngrok-skip-browser-warning": "true" 
  },
});

api.interceptors.request.use(config => {
  const state = store.getState();
  const token = state.user.token; // récupère le token depuis Redux
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

export default api;
