// src/services/calendarService.js
import api from '@/utils/axios';

export const calendarService = {
  /**
   * Get all events for current user
   */
  async getAll(filters = {}) {
    const params = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.type) params.type = filters.type;
    if (filters.completed !== undefined) params.completed = filters.completed;
    
    return await api.get('/calendar', { params });
  },

  /**
   * Get upcoming events
   */
  async getUpcoming(limit = 10) {
    return await api.get('/calendar/upcoming', { params: { limit } });
  },

  /**
   * Get single event by ID
   */
  async getById(id) {
    return await api.get(`/calendar/${id}`);
  },

  /**
   * Create a new event
   */
  async create(eventData) {
    return await api.post('/calendar', eventData);
  },

  /**
   * Update an event
   */
  async update(id, data) {
    return await api.put(`/calendar/${id}`, data);
  },

  /**
   * Mark event as completed
   */
  async complete(id, actualDuration) {
    return await api.patch(`/calendar/${id}/complete`, { actualDuration });
  },

  /**
   * Delete an event
   */
  async delete(id) {
    return await api.delete(`/calendar/${id}`);
  },

  /**
   * Get events for a specific date range
   */
  async getByDateRange(startDate, endDate) {
    return await api.get('/calendar', {
      params: { startDate, endDate }
    });
  },

  /**
   * Get events for a specific month
   */
  async getByMonth(year, month) {
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    return this.getByDateRange(startDate, endDate);
  },

  /**
   * Get events for today
   */
  async getToday() {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();
    return this.getByDateRange(startDate, endDate);
  }
};