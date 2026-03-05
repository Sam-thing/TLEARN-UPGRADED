import api from './api';

export const notesService = {
  async getAll(filters = {}) {
    return await api.get('/notes', { params: filters });
  },

  async getById(id) {
    return await api.get(`/notes/${id}`);
  },

  async create(data) {
    return await api.post('/notes', data);
  },

  async update(id, data) {
    return await api.put(`/notes/${id}`, data);
  },

  async delete(id) {
    return await api.delete(`/notes/${id}`);
  },

  async uploadPDF(file) {
    const formData = new FormData();
    formData.append('pdf', file);
    return await api.post('/notes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async generateNotes(topicId) {
    return await api.post('/notes/generate', { topicId });
  },
};