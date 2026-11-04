import axios from 'axios';

// shared axios client with base api url
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// attach bearer token to every outgoing request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stockflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// if backend returns 401 unauthorized, log out locally and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('stockflow_token')) {
        localStorage.removeItem('stockflow_token');
        localStorage.removeItem('stockflow_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
