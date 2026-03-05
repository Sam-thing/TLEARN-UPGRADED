import api from './api';

export const authService = {
  async login(email, password) {
    return await api.post('/auth/login', { email, password });
  },

  async register(userData) {
    return await api.post('/auth/register', userData);
  },

  async getCurrentUser() {
    return await api.get('/auth/me');
  },

  async updateProfile(data) {
    return await api.put('/auth/profile', data);
  },

  async changePassword(oldPassword, newPassword) {
    return await api.put('/auth/password', { oldPassword, newPassword });
  },

  async logout() {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  },
};