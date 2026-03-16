import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tlearnapp.onrender.com',
  withCredentials: true,
});

// Add token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;