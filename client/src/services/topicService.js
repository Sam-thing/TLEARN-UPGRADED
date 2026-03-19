// src/services/topicService.js
import api from '@/utils/axios';

export const topicService = {
  async getAll(filters = {}) {
    const response = await api.get('/topics', { params: filters });
    return response.topics || response;  // ← Extract .topics
  },

  async getById(id) {
    const response = await api.get(`/topics/${id}`);
    return response.topic || response;  // ← Extract .topic
  },

  async create(data) {
    const response = await api.post('/topics', data);
    return response.topic || response;
  },

  async update(id, data) {
    const response = await api.put(`/topics/${id}`, data);
    return response.topic || response;
  },

  async delete(id) {
    const response = await api.delete(`/topics/${id}`);
    return response;
  },

  async search(query) {
    const response = await api.get('/topics/search', { params: { q: query } });
    return response.topics || response;
  },

  async getPopular() {
    const response = await api.get('/topics/popular');
    return response.topics || response;  // ← Extract .topics
  },

  async getRecommended() {
    const response = await api.get('/topics/recommended');
    return response.topics || response;  // ← Extract .topics
  },

  async generatePrepNotes(id) {
    const response = await api.post(`/topics/${id}/prep-notes`);
    return response;
  },
};