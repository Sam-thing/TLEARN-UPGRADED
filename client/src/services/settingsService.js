// src/services/settingsService.js
import api from '@/utils/axios';

export const settingsService = {
  // Get user settings
  async getSettings() {
    const response = await api.get('/settings');
    return response.settings;
  },

  // Update settings
  async updateSettings(settings) {
    const response = await api.put('/settings', settings);
    return response.settings;
  },

  // Change password
  async changePassword(oldPassword, newPassword) {
    const response = await api.post('/settings/change-password', {
      oldPassword,
      newPassword
    });
    return response;
  },

  // Export user data
  async exportData() {
    const response = await api.get('/settings/export');
    return response;
  },

  // Delete account
  async deleteAccount(password) {
    const response = await api.delete('/settings/account', {
      data: { password }
    });
    return response;
  }
};