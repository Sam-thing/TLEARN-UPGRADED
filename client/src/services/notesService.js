// src/services/notesService.js
import api from '@/utils/axios';

const API_URL = '/notes';  // ← Just the path!

export const notesService = {
  // Get all notes
  async getAll() {
    const response = await api.get(API_URL);
    return response.notes || response;  // ← Extract .notes
  },

  // Get single note
  async getById(id) {
    const response = await api.get(`${API_URL}/${id}`);
    return response.note || response;  // ← Extract .note (singular)
  },

  // Create note
  async create(noteData) {
    const response = await api.post(API_URL, noteData);
    return response.note || response;  // ← Extract .note
  },

  // Update note
  async update(id, noteData) {
    const response = await api.put(`${API_URL}/${id}`, noteData);
    return response.note || response;  // ← Extract .note
  },

  // Delete note
  async delete(id) {
    const response = await api.delete(`${API_URL}/${id}`);
    return response;  // ← Just return response
  },

  // Generate notes with AI
  async generateNotes(topicId) {
    const response = await api.post(`${API_URL}/generate`, { topicId });
    return response.note || response;  // ← Extract .note
  },

  // Toggle pin status
  async togglePin(id) {
    const response = await api.patch(`${API_URL}/${id}/pin`);
    return response.note || response;  // ← Extract .note
  },

  // Get all unique tags
  async getAllTags() {
    const response = await api.get(`${API_URL}/tags`);
    return response.tags || response;  // ← Extract .tags
  }
};