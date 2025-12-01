// src/api/axios.ts
import axios from 'axios';
import { store } from '@/store/store'; // ton Redux store


const api = axios.create({
  baseURL: 'https://bypass-api.jobs-conseil.host/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
     "ngrok-skip-browser-warning": "true" 
  },
  withCredentials: true,
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
