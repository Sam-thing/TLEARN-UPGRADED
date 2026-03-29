// src/services/gamificationService.js
import api from '@/utils/axios';

export const gamificationService = {
  // Get user's gamification profile
  async getProfile() {
    const response = await api.get('/gamification');
    return response;
  },

  // Get achievements (earned + new ones)
  async getAchievements() {
    const response = await api.get('/gamification/achievements');
    return response;
  },

  // Get leaderboard
  async getLeaderboard(type = 'weekly', limit = 50) {
    const response = await api.get(`/gamification/leaderboard?type=${type}&limit=${limit}`);
    return response;
  },

  // Award XP manually (useful for testing)
  async awardXP(amount, reason = '') {
    const response = await api.post('/gamification/xp', { 
      amount, 
      reason 
    });
    return response;
  },

  // Track activity and award XP automatically
  async trackActivity(activity, metadata = {}) {
    const response = await api.post('/gamification/activity', {
      activity,
      metadata
    });
    return response;
  },

  // Get detailed stats
  async getStats() {
    const response = await api.get('/gamification/stats');
    return response;
  }
};