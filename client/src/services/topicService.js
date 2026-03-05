import api from './api';

export const topicService = {
  async getAll(filters = {}) {
    return await api.get('/topics', { params: filters });
  },

  async getById(id) {
    return await api.get(`/topics/${id}`);
  },

  async create(data) {
    return await api.post('/topics', data);
  },

  async update(id, data) {
    return await api.put(`/topics/${id}`, data);
  },

  async delete(id) {
    return await api.delete(`/topics/${id}`);
  },

  async search(query) {
    return await api.get('/topics/search', { params: { q: query } });
  },

  async getPopular() {
    return await api.get('/topics/popular');
  },

  async getRecommended() {
    return await api.get('/topics/recommended');
  },

  async generatePrepNotes(id) {
    return await api.post(`/topics/${id}/prep-notes`);
  },
};