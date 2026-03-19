// src/services/sessionService.js
import api from '@/utils/axios';

export const sessionService = {
  // Get all sessions for current user
  async getAll() {
    return await api.get('/sessions');
  },

  // Get single session by ID
  async getById(id) {
    return await api.get(`/sessions/${id}`);
  },

  // Create new session
  async create(formData) {
    return await api.post('/sessions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Delete session
  async delete(id) {
    return await api.delete(`/sessions/${id}`);
  },

  // Get sessions by topic
  async getByTopic(topicId) {
    return await api.get(`/sessions/topic/${topicId}`);
  },

  // Get recent sessions
  async getRecent(limit = 10) {
    return await api.get('/sessions/recent', { params: { limit } });
  },

  // Get user stats
  async getStats() {
    return await api.get('/sessions/stats');
  }
};