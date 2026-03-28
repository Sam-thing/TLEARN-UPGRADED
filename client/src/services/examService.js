// src/services/examService.js
import api from '@/utils/axios';

export const examService = {
  /**
   * Get all exams for current user
   */
  async getAll(status) {
    const params = status ? { status } : {};
    return await api.get('/exams', { params });
  },

  /**
   * Get single exam by ID
   */
  async getById(id) {
    return await api.get(`/exams/${id}`);
  },

  /**
   * Create a new exam manually
   */
  async create(examData) {
    return await api.post('/exams', examData);
  },

  /**
   * Generate exam with AI
   */
  async generate(data) {
    return await api.post('/exams/generate', data);
  },

  /**
   * Start taking an exam
   */
  async start(id) {
    return await api.post(`/exams/${id}/start`);
  },

  /**
   * Submit exam answers
   */
  async submit(id, answers) {
    return await api.post(`/exams/${id}/submit`, { answers });
  },

  /**
   * Delete an exam
   */
  async delete(id) {
    return await api.delete(`/exams/${id}`);
  },

  /**
   * Get exam statistics
   */
  async getStats() {
    return await api.get('/exams/stats');
  }
};