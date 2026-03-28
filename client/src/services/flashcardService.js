// src/services/flashcardService.js
import api from '@/utils/axios';

export const flashcardService = {
  /**
   * Get all flashcards for current user
   */
  async getAll(filters = {}) {
    const params = {};
    if (filters.topic) params.topic = filters.topic;
    if (filters.tags) params.tags = filters.tags;
    if (filters.limit) params.limit = filters.limit;
    
    return await api.get('/flashcards', { params });
  },

  /**
   * Get flashcards due for review (spaced repetition)
   */
  async getDue(limit = 20) {
    return await api.get('/flashcards/due', { params: { limit } });
  },

  /**
   * Get single flashcard by ID
   */
  async getById(id) {
    return await api.get(`/flashcards/${id}`);
  },

  /**
   * Create a new flashcard manually
   */
  async create(flashcardData) {
    return await api.post('/flashcards', flashcardData);
  },

  /**
   * Generate flashcards with AI
   */
  async generate(data) {
    return await api.post('/flashcards/generate', data);
  },

  /**
   * Review a flashcard (update spaced repetition)
   */
  async review(id, quality) {
    return await api.post(`/flashcards/${id}/review`, { quality });
  },

  /**
   * Update a flashcard
   */
  async update(id, data) {
    return await api.put(`/flashcards/${id}`, data);
  },

  /**
   * Delete a flashcard
   */
  async delete(id) {
    return await api.delete(`/flashcards/${id}`);
  },

  /**
   * Get flashcard statistics
   */
  async getStats() {
    return await api.get('/flashcards/stats');
  }
};