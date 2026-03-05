import api from './api';

export const progressService = {
  async getProgress() {
    return await api.get('/progress');
  },

  async getStats() {
    return await api.get('/progress/stats');
  },

  async getDailyActivity() {
    return await api.get('/progress/daily');
  },

  async getTopicMastery() {
    return await api.get('/progress/topics');
  },

  async addGoal(goal) {
    return await api.post('/progress/goals', goal);
  },

  async updateGoal(id, data) {
    return await api.put(`/progress/goals/${id}`, data);
  },

  async deleteGoal(id) {
    return await api.delete(`/progress/goals/${id}`);
  },
};