// src/services/sessionService.js
import api from '@/utils/axios';

export const sessionService = {
  // Get all sessions for current user
  async getAll() {
    const response = await api.get('/sessions');
    return response.sessions || response;
  },

  // Get single session by ID
  async getById(id) {
    const response = await api.get(`/sessions/${id}`);
    return response.session || response;
  },

  // Create new session
  async create(formData) {
    const response = await api.post('/sessions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.session || response;
  },

  // Delete session
  async delete(id) {
    const response = await api.delete(`/sessions/${id}`);
    return response;
  },

  // Get sessions by topic
  async getByTopic(topicId) {
    const response = await api.get(`/sessions/topic/${topicId}`);
    return response.sessions || response;
  },

  // Get recent sessions
  async getRecent(limit = 10) {
    const response = await api.get('/sessions/recent', { params: { limit } });
    return response.sessions || response;
  },

  // Get user stats
  async getStats() {
    const response = await api.get('/sessions/stats');
    return response.stats || response;
  }
};