// src/services/roomService.js 
import api from '@/utils/axios';

const API_URL = 'api/rooms';

export const roomService = {
  // Get all rooms with optional filters
  async getAll(filters = {}) {
    const response = await api.get('/rooms', { params: filters });
    return response.rooms || response;
  },

  // Get single room by ID
  async getById(id) {
    const response = await api.get(`${API_URL}/${id}`);
    return response.room || response;
  },

  // Create new room
  async create(data) {
    const response = await api.post(API_URL, data);
    return response.room || response;
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
    return response.rooms || response;  
  },

  // Get matched rooms for a topic
  async getMatched(topicId) {
    const response = await api.get(`${API_URL}/matched/${topicId}`);
    return response.rooms || response;
  },

  // Get room members
  async getMembers(id) {
    const response = await api.get(`${API_URL}/${id}/members`);
    return response.members || response;
  },

  // Get room messages
  async getMessages(id, limit = 50) {
    const response = await api.get(`${API_URL}/${id}/messages`, { 
      params: { limit } 
    });
    return response.messages || response;
  },

  // Send message to room
  async sendMessage(roomId, content) {
    const response = await api.post(`${API_URL}/${roomId}/messages`, { 
      content 
    });
    return response;
  },
};