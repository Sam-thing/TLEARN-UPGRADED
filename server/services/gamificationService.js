// server/services/gamificationService.js - FINAL VERSION
import Gamification from '../models/Gamification.js';
import { XP_REWARDS, checkAchievements } from '../config/achievement.js';

class GamificationService {

  async getOrCreateProfile(userId) {
    let profile = await Gamification.findOne({ user: userId });
    if (!profile) {
      profile = await Gamification.create({ user: userId });
    }
    return profile;
  }

  async trackActivity(userId, activity, metadata = {}) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      let xpAwarded = 0;

      switch (activity) {
        case 'session_completed':
          profile.sessionsCompleted += 1;
          xpAwarded = XP_REWARDS.SESSION_COMPLETED;
          if (metadata.duration) profile.studyHours += (metadata.duration / 60);
          break;

        case 'exam_completed':
          profile.examsCompleted += 1;
          xpAwarded = XP_REWARDS.EXAM_COMPLETED;
          if (metadata.passed) xpAwarded += XP_REWARDS.EXAM_PASSED;
          if (metadata.score === 100) xpAwarded += XP_REWARDS.EXAM_PERFECT;
          break;

        case 'flashcard_reviewed':
          profile.flashcardsReviewed += 1;
          xpAwarded = XP_REWARDS.FLASHCARD_REVIEWED;
          if (metadata.mastered) xpAwarded += XP_REWARDS.FLASHCARD_MASTERED;
          break;

        default:
          xpAwarded = 10;
      }

      const levelUpResult = profile.addXP(xpAwarded);
      profile.weeklyPoints += xpAwarded;
      profile.monthlyPoints += xpAwarded;

      await profile.save();

      return {
        success: true,
        xpAwarded,
        leveledUp: levelUpResult.leveledUp,
        newLevel: levelUpResult.newLevel,
        profile
      };

    } catch (error) {
      console.error('Gamification trackActivity error:', error);
      return { success: false, error: error.message };
    }
  }

  // ... (you can keep other methods if you have them)
}

const gamificationService = new GamificationService();

export { gamificationService };