import axios from 'axios';
import { API_BASE } from '../constants/apiEndpoints';

// =====================================================
// Axios Instance — configured for ASP.NET Core 8 API
// Swap VITE_API_BASE_URL in .env to point at your server
// =====================================================
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

// ── Request Interceptor: attach JWT token ──────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('af_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: handle errors globally ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response?.status === 401) {
      // Token expired or invalid → clear and redirect to login
      localStorage.removeItem('af_token');
      localStorage.removeItem('af_user');
      window.location.href = '/login';
    }

    if (response?.status === 403) {
      console.warn('Access denied:', response.data?.message);
    }

    // Return a normalised error payload
    return Promise.reject({
      status:  response?.status,
      message: response?.data?.message || response?.data?.title || 'An error occurred',
      errors:  response?.data?.errors  || null,
    });
  }
);

export default api;
