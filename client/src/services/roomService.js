// src/services/roomService.js 
import api from '@/utils/api';

const API_URL = '/rooms';

export const roomService = {
  // Get all rooms with optional filters
  async getAll(filters = {}) {
    const response = await api.get(API_URL, { params: filters });
    return response;
  },

  // Get single room by ID
  async getById(id) {
    const response = await api.get(`${API_URL}/${id}`);
    return response;
  },

  // Create new room
  async create(data) {
    const response = await api.post(API_URL, data);
    return response;
  },

  // Join a room
  async join(id, consent = true) {
    const response = await api.post(`${API_URL}/${id}/join`, { 
      hasConsented: consent 
    });
    return response;
  },

  // Leave a room
  async leave(id) {
    const response = await api.post(`${API_URL}/${id}/leave`);
    return response;
  },

  // Get matched rooms for a topic
  async getMatched(topicId) {
    const response = await api.get(`${API_URL}/matched/${topicId}`);
    return response;
  },

  // Get room members
  async getMembers(id) {
    const response = await api.get(`${API_URL}/${id}/members`);
    return response;
  },

  // Get room messages
  async getMessages(id, limit = 50) {
    const response = await api.get(`${API_URL}/${id}/messages`, { 
      params: { limit } 
    });
    return response;
  },

  // Send message to room
  async sendMessage(roomId, content) {
    const response = await api.post(`${API_URL}/${roomId}/messages`, { 
      content 
    });
    return response;
  },
};