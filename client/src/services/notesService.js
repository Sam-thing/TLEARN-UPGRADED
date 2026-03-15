// src/services/notesService.js - ACTUALLY FIXED THIS TIME
import api from '@/utils/axios'; // ← USE YOUR CUSTOM AXIOS!

const API_URL = '/api/notes';

export const notesService = {
  // Get all notes
  async getAll() {
    const response = await api.get(API_URL); // ← api, not axios
    return response.data.notes;
  },

  // Get single note
  async getById(id) {
    const response = await api.get(`${API_URL}/${id}`); // ← api, not axios
    return response.data.notes;
  },

  // Create note
  async create(noteData) {
    const response = await api.post(API_URL, noteData); // ← api, not axios
    return response.data.notes;
  },

  // UPDATE NOTE
  async update(id, noteData) {
    const response = await api.put(`${API_URL}/${id}`, noteData); // ← api, not axios
    return response.data.notes;
  },

  // Delete note
  async delete(id) {
    const response = await api.delete(`${API_URL}/${id}`); // ← api, not axios
    return response.data.notes;
  },

  // Generate notes with AI
  async generateNotes(topicId) {
    const response = await api.post(`${API_URL}/generate`, { topicId }); // ← api, not axios
    return response.data.notes;
  },

  // Toggle pin status
  async togglePin(id) {
    const response = await api.patch(`${API_URL}/${id}/pin`);
    return response.data.note;
  },

  // Get all unique tags
  async getAllTags() {
    const response = await api.get(`${API_URL}/tags`);
    return response.data.tags;
  }
};