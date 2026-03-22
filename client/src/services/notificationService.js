// src/services/notificationService.js
import api from '@/utils/axios';

export const notificationService = {
  async getAll(unreadOnly = false) {
    const response = await api.get('/notifications', { params: { unreadOnly } });
    return response;  // Returns { notifications: [], unreadCount: 0 }
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.count;
  },

  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response;
  },

  async markAllAsRead() {
    const response = await api.patch('/notifications/mark-all-read');
    return response;
  },

  async delete(id) {
    const response = await api.delete(`/notifications/${id}`);
    return response;
  },

  async clearAll() {
    const response = await api.delete('/notifications');
    return response;
  }
};