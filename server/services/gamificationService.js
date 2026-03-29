// server/services/gamificationService.js
import Gamification from '../models/Gamification.js';
import { XP_REWARDS, checkAchievements } from '../config/achievements.js';

/**
 * Gamification Service - Business Logic Layer
 */
class GamificationService {

  /**
   * Get or create gamification profile for a user
   */
  async getOrCreateProfile(userId) {
    let profile = await Gamification.findOne({ user: userId });

    if (!profile) {
      profile = await Gamification.create({ user: userId });
    }

    return profile;
  }

  /**
   * Track activity and award XP automatically
   */
  async trackActivity(userId, activity, metadata = {}) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      let xpAwarded = 0;
      let activityData = {};

      switch (activity) {
        case 'session_completed':
          profile.sessionsCompleted += 1;
          xpAwarded = XP_REWARDS.SESSION_COMPLETED;
          if (metadata.duration) {
            profile.studyHours += (metadata.duration / 60);
          }
          activityData = { duration: metadata.duration };
          break;

        case 'exam_completed':
          profile.examsCompleted += 1;
          xpAwarded = XP_REWARDS.EXAM_COMPLETED;
          if (metadata.passed) xpAwarded += XP_REWARDS.EXAM_PASSED;
          if (metadata.score === 100) xpAwarded += XP_REWARDS.EXAM_PERFECT;
          activityData = { score: metadata.score, passed: metadata.passed };
          break;

        case 'flashcard_reviewed':
          profile.flashcardsReviewed += 1;
          xpAwarded = XP_REWARDS.FLASHCARD_REVIEWED;
          if (metadata.mastered) xpAwarded += XP_REWARDS.FLASHCARD_MASTERED;
          activityData = { mastered: metadata.mastered };
          break;

        case 'daily_goal_met':
          xpAwarded = XP_REWARDS.DAILY_GOAL_MET;
          break;

        case 'streak_continued':
          xpAwarded = XP_REWARDS.STREAK_CONTINUED;
          break;

        case 'helped_user':
          profile.helpedOthers += 1;
          xpAwarded = XP_REWARDS.HELP_ANOTHER_USER;
          break;

        case 'group_session':
          profile.studyGroups += 1;
          xpAwarded = XP_REWARDS.GROUP_SESSION_COMPLETED;
          break;

        default:
          xpAwarded = 10; // default small reward
      }

      // Add XP and check for level up
      const levelUpResult = profile.addXP(xpAwarded);

      // Update weekly & monthly points
      profile.weeklyPoints += xpAwarded;
      profile.monthlyPoints += xpAwarded;

      // Check for new achievements
      const user = await import('../models/User.js').then(m => m.default.findById(userId));
      const newAchievements = checkAchievements(profile, user?.stats || {});

      // Award new achievements
      for (const achievement of newAchievements) {
        profile.awardAchievement(achievement);
      }

      await profile.save();

      return {
        success: true,
        xpAwarded,
        leveledUp: levelUpResult.leveledUp,
        newLevel: levelUpResult.newLevel,
        newAchievements,
        profile
      };

    } catch (error) {
      console.error('Gamification trackActivity error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Award XP manually
   */
  async awardXP(userId, amount, reason = '') {
    try {
      const profile = await this.getOrCreateProfile(userId);
      const result = profile.addXP(amount);

      profile.weeklyPoints += amount;
      profile.monthlyPoints += amount;

      await profile.save();

      return {
        success: true,
        xpAwarded: amount,
        reason,
        ...result,
        profile
      };
    } catch (error) {
      console.error('Gamification awardXP error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get full gamification profile
   */
  async getProfile(userId) {
    const profile = await Gamification.findOne({ user: userId })
      .populate('user', 'name email');

    if (!profile) {
      return await this.getOrCreateProfile(userId);
    }

    return profile;
  }

  /**
   * Reset weekly points (for cron job)
   */
  async resetWeeklyPoints() {
    await Gamification.updateMany({}, { 
      weeklyPoints: 0, 
      lastWeeklyReset: new Date() 
    });
  }

  /**
   * Reset monthly points (for cron job)
   */
  async resetMonthlyPoints() {
    await Gamification.updateMany({}, { 
      monthlyPoints: 0, 
      lastMonthlyReset: new Date() 
    });
  }
}

export default new GamificationService();