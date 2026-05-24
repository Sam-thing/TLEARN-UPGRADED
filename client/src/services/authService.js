// src/services/authService.js
import api from '@/utils/axios';

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

  // Calls the correct endpoint - /auth/profile
  async updateProfile(data) {
    const response = await api.patch('/auth/profile', data);
    return response.user || response;
  },

  async changePassword(oldPassword, newPassword) {
    return await api.post('/settings/change-password', { oldPassword, newPassword });
  },

  async logout() {
    localStorage.removeItem('token');
  },
};