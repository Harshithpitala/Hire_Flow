import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hireflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 Session Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired credentials and emit storage event
      localStorage.removeItem('hireflow_token');
      localStorage.removeItem('hireflow_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;