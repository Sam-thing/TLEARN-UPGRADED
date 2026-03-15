import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tlearn-upgraded.vercel.app/api',
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on landing/login page
      if (!window.location.pathname.startsWith('/login') && window.location.pathname !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/'; // Changed from '/login' to '/'
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;