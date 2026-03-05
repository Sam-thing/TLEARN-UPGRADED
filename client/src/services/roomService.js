import api from './api';

export const roomService = {
  async getAll(filters = {}) {
    return await api.get('/rooms', { params: filters });
  },

  async getById(id) {
    return await api.get(`/rooms/${id}`);
  },

  async create(data) {
    return await api.post('/rooms', data);
  },

  async join(id, consent = true) {
    return await api.post(`/rooms/${id}/join`, { hasConsented: consent });
  },

  async leave(id) {
    return await api.post(`/rooms/${id}/leave`);
  },

  async getMatched(topicId) {
    return await api.get(`/rooms/matched/${topicId}`);
  },

  async getMembers(id) {
    return await api.get(`/rooms/${id}/members`);
  },

  async getMessages(id, limit = 50) {
    return await api.get(`/rooms/${id}/messages`, { params: { limit } });
  },

  async sendMessage(id, content) {
    return await api.post(`/rooms/${id}/messages`, content);
  },
};