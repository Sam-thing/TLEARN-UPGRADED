import api from './api';

export const sessionService = {
  async create(formData) {
    return await api.post('/sessions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async getAll(filters = {}) {
    return await api.get('/sessions', { params: filters });
  },

  async getById(id) {
    return await api.get(`/sessions/${id}`);
  },

  async getRecent(limit = 5) {
    return await api.get(`/sessions/recent?limit=${limit}`);
  },

  async getStats() {
    return await api.get('/sessions/stats');
  },

  async delete(id) {
    return await api.delete(`/sessions/${id}`);
  },

  async retry(topicId) {
    return await api.post(`/sessions/retry/${topicId}`);
  },
};