// src/services/settingsService.js
import api from '@/utils/axios';

const API_URL = `${import.meta.env.VITE_API_URL}/settings`;

export const settingsService = {
  // Get user settings
  async getSettings() {
    const response = await api.get(API_URL);
    return response.data.settings;
  },

  // Update settings
  async updateSettings(settings) {
    const response = await api.put(API_URL, settings);
    return response.data.settings;
  },

  // Change password
  async changePassword(oldPassword, newPassword) {
    const response = await api.post(`${API_URL}/change-password`, {
      oldPassword,
      newPassword
    });
    return response.data;
  },

  // Export user data
  async exportData() {
    const response = await api.get(`${API_URL}/export`);
    return response.data;
  },

  // Delete account
  async deleteAccount(password) {
    const response = await api.delete(`${API_URL}/account`, {
      data: { password }
    });
    return response.data;
  }
};