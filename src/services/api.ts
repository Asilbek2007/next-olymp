import axios from 'axios';

// Base Axios Client - framework agnostic for future React Native reuse
export const apiClient = axios.create({
  baseURL: 'https://api.nextolymp.uz/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('next_olymp_jwt');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token & dispatch logout event if necessary
      localStorage.removeItem('next_olymp_jwt');
    }
    return Promise.reject(error);
  }
);
