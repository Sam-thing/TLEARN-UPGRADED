// server/services/gamificationService.js
import Gamification from '../models/Gamification.js';
import User from '../models/User.js';
import { XP_REWARDS, checkAchievements } from '../config/achievements.js';

/**
 * Get or create user's gamification profile
 */
export const getOrCreateProfile = async (userId) => {
  let profile = await Gamification.findOne({ user: userId });
  
  if (!profile) {
    profile = await Gamification.create({
      user: userId,
      totalXP: 0,
      level: 1,
      currentLevelXP: 0,
      xpToNextLevel: 100
    });
  }
  
  return profile;
};

/**
 * Award XP to user and handle level ups
 */
export const awardXP = async (userId, amount, reason = '') => {
  const profile = await getOrCreateProfile(userId);
  
  // Add XP and check for level up
  const result = profile.addXP(amount);
  
  // Update points
  profile.weeklyPoints += amount;
  profile.monthlyPoints += amount;
  
  await profile.save();
  
  return {
    profile,
    xpAwarded: amount,
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
    message: `+${amount} XP${reason ? ': ' + reason : ''}`,
    levelUpMessage: result.leveledUp ? `🎉 Level Up! You're now Level ${result.newLevel}!` : null
  };
};

/**
 * Track activity and automatically award XP
 */
export const trackActivity = async (userId, activity, metadata = {}) => {
  const profile = await getOrCreateProfile(userId);
  const user = await User.findById(userId);
  
  let xpAwarded = 0;
  let activityDescription = '';
  
  // Process different activity types
  switch (activity) {
    case 'session_completed':
      profile.sessionsCompleted += 1;
      xpAwarded = XP_REWARDS.SESSION_COMPLETED;
      activityDescription = 'Session completed';
      
      // Add study hours
      if (metadata.duration) {
        const hours = metadata.duration / 60;
        profile.studyHours += hours;
        
        // Bonus for long sessions
        if (hours >= 2) {
          xpAwarded += 10; // +10 XP for 2+ hour sessions
        }
      }
      
      // Check for time-based achievements
      const hour = new Date().getHours();
      if (hour < 8 && !user.stats?.earlyBirdSessions) {
        user.stats = user.stats || {};
        user.stats.earlyBirdSessions = (user.stats.earlyBirdSessions || 0) + 1;
        await user.save();
      }
      if (hour >= 22 && !user.stats?.nightOwlSessions) {
        user.stats = user.stats || {};
        user.stats.nightOwlSessions = (user.stats.nightOwlSessions || 0) + 1;
        await user.save();
      }
      break;
      
    case 'exam_completed':
      profile.examsCompleted += 1;
      xpAwarded = XP_REWARDS.EXAM_COMPLETED;
      activityDescription = 'Exam completed';
      
      // Bonus for passing
      if (metadata.passed) {
        xpAwarded += XP_REWARDS.EXAM_PASSED;
        activityDescription = 'Exam passed';
      }
      
      // Bonus for perfect score
      if (metadata.score === 100) {
        xpAwarded += XP_REWARDS.EXAM_PERFECT;
        activityDescription = 'Perfect exam score';
        
        // Track perfect exams
        user.stats = user.stats || {};
        user.stats.perfectExams = (user.stats.perfectExams || 0) + 1;
        await user.save();
      }
      break;
      
    case 'flashcard_reviewed':
      profile.flashcardsReviewed += 1;
      xpAwarded = XP_REWARDS.FLASHCARD_REVIEWED;
      activityDescription = 'Flashcard reviewed';
      
      // Bonus for mastered cards
      if (metadata.mastered) {
        xpAwarded += XP_REWARDS.FLASHCARD_MASTERED;
        activityDescription = 'Flashcard mastered';
      }
      break;
      
    case 'daily_goal_met':
      xpAwarded = XP_REWARDS.DAILY_GOAL_MET;
      activityDescription = 'Daily goal completed';
      profile.perfectDays += 1;
      break;
      
    case 'streak_continued':
      xpAwarded = XP_REWARDS.STREAK_CONTINUED;
      activityDescription = 'Streak continued';
      
      // Update longest streak
      const currentStreak = user.stats?.streak?.current || 0;
      if (currentStreak > profile.longestStreak) {
        profile.longestStreak = currentStreak;
      }
      break;
      
    case 'helped_user':
      profile.helpedOthers += 1;
      xpAwarded = XP_REWARDS.HELP_ANOTHER_USER;
      activityDescription = 'Helped another student';
      break;
      
    case 'group_session':
      profile.studyGroups += 1;
      xpAwarded = XP_REWARDS.GROUP_SESSION_COMPLETED;
      activityDescription = 'Group study session';
      break;
      
    default:
      throw new Error(`Unknown activity type: ${activity}`);
  }
  
  // Award XP
  const result = profile.addXP(xpAwarded);
  profile.weeklyPoints += xpAwarded;
  profile.monthlyPoints += xpAwarded;
  
  // Check for new achievements
  const newAchievements = checkAchievements(profile, user.stats || {});
  
  // Award achievements
  for (const achievement of newAchievements) {
    profile.awardAchievement(achievement);
  }
  
  await profile.save();
  
  return {
    xpAwarded,
    activityDescription,
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
    newAchievements: newAchievements.length > 0 ? newAchievements : null,
    profile
  };
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (type = 'weekly', limit = 100) => {
  let sortField;
  
  switch (type) {
    case 'weekly':
      sortField = { weeklyPoints: -1 };
      break;
    case 'monthly':
      sortField = { monthlyPoints: -1 };
      break;
    case 'all-time':
      sortField = { totalXP: -1 };
      break;
    case 'level':
      sortField = { level: -1, currentLevelXP: -1 };
      break;
    default:
      sortField = { weeklyPoints: -1 };
  }
  
  const leaderboard = await Gamification.find()
    .populate('user', 'name email avatar')
    .sort(sortField)
    .limit(limit)
    .lean();
  
  return leaderboard.map((entry, index) => ({
    rank: index + 1,
    userId: entry.user._id,
    name: entry.user.name,
    email: entry.user.email,
    avatar: entry.user.avatar,
    level: entry.level,
    title: entry.title,
    totalXP: entry.totalXP,
    weeklyPoints: entry.weeklyPoints,
    monthlyPoints: entry.monthlyPoints,
    achievementCount: entry.achievementCount
  }));
};

/**
 * Get user's rank in leaderboard
 */
export const getUserRank = async (userId, type = 'weekly') => {
  let sortField;
  
  switch (type) {
    case 'weekly':
      sortField = { weeklyPoints: -1 };
      break;
    case 'monthly':
      sortField = { monthlyPoints: -1 };
      break;
    case 'all-time':
      sortField = { totalXP: -1 };
      break;
    case 'level':
      sortField = { level: -1, currentLevelXP: -1 };
      break;
    default:
      sortField = { weeklyPoints: -1 };
  }
  
  const allProfiles = await Gamification.find().sort(sortField);
  const rank = allProfiles.findIndex(p => p.user.toString() === userId.toString()) + 1;
  
  return rank || null;
};

/**
 * Get user achievements with unlock status
 */
export const getUserAchievements = async (userId) => {
  const profile = await getOrCreateProfile(userId);
  const user = await User.findById(userId);
  
  // Check for new achievements
  const newAchievements = checkAchievements(profile, user.stats || {});
  
  // Award new achievements
  for (const achievement of newAchievements) {
    profile.awardAchievement(achievement);
  }
  
  if (newAchievements.length > 0) {
    await profile.save();
  }
  
  return {
    earned: profile.achievements,
    newAchievements: newAchievements.length > 0 ? newAchievements : null,
    totalEarned: profile.achievementCount
  };
};

/**
 * Get user stats
 */
export const getUserStats = async (userId) => {
  const profile = await getOrCreateProfile(userId);
  
  // Calculate progress percentage
  const progressPercent = (profile.currentLevelXP / profile.xpToNextLevel) * 100;
  
  // Get rank
  const rank = await getUserRank(userId, 'all-time');
  
  return {
    level: profile.level,
    title: profile.title,
    totalXP: profile.totalXP,
    currentLevelXP: profile.currentLevelXP,
    xpToNextLevel: profile.xpToNextLevel,
    progressPercent: Math.round(progressPercent),
    rank,
    weeklyPoints: profile.weeklyPoints,
    monthlyPoints: profile.monthlyPoints,
    allTimePoints: profile.allTimePoints,
    achievementCount: profile.achievementCount,
    sessionsCompleted: profile.sessionsCompleted,
    examsCompleted: profile.examsCompleted,
    flashcardsReviewed: profile.flashcardsReviewed,
    studyHours: Math.round(profile.studyHours * 10) / 10,
    longestStreak: profile.longestStreak,
    perfectDays: profile.perfectDays
  };
};

/**
 * Reset weekly leaderboard
 */
export const resetWeeklyLeaderboard = async () => {
  await Gamification.updateMany(
    {},
    { 
      weeklyPoints: 0,
      lastWeeklyReset: new Date()
    }
  );
  
  return { message: 'Weekly leaderboard reset successfully' };
};

/**
 * Reset monthly leaderboard
 */
export const resetMonthlyLeaderboard = async () => {
  await Gamification.updateMany(
    {},
    { 
      monthlyPoints: 0,
      lastMonthlyReset: new Date()
    }
  );
  
  return { message: 'Monthly leaderboard reset successfully' };
};

/**
 * Award badge to user
 */
export const awardBadge = async (userId, badgeId, badgeName) => {
  const profile = await getOrCreateProfile(userId);
  
  // Check if badge already exists
  const hasBadge = profile.badges.find(b => b.id === badgeId);
  if (hasBadge) {
    return { success: false, message: 'Badge already earned' };
  }
  
  profile.badges.push({
    id: badgeId,
    name: badgeName,
    earnedAt: new Date()
  });
  
  await profile.save();
  
  return {
    success: true,
    badge: { id: badgeId, name: badgeName },
    message: `🏅 Badge earned: ${badgeName}!`
  };
};

/**
 * Get top performers (for showcasing)
 */
export const getTopPerformers = async (limit = 10) => {
  const topByXP = await Gamification.find()
    .populate('user', 'name avatar')
    .sort({ totalXP: -1 })
    .limit(limit)
    .lean();
  
  const topByLevel = await Gamification.find()
    .populate('user', 'name avatar')
    .sort({ level: -1, currentLevelXP: -1 })
    .limit(limit)
    .lean();
  
  const topByAchievements = await Gamification.find()
    .populate('user', 'name avatar')
    .sort({ achievementCount: -1 })
    .limit(limit)
    .lean();
  
  return {
    topByXP: topByXP.map(p => ({
      name: p.user.name,
      avatar: p.user.avatar,
      level: p.level,
      totalXP: p.totalXP
    })),
    topByLevel: topByLevel.map(p => ({
      name: p.user.name,
      avatar: p.user.avatar,
      level: p.level,
      title: p.title
    })),
    topByAchievements: topByAchievements.map(p => ({
      name: p.user.name,
      avatar: p.user.avatar,
      achievementCount: p.achievementCount
    }))
  };
};

/**
 * Get gamification summary for dashboard
 */
export const getDashboardSummary = async (userId) => {
  const profile = await getOrCreateProfile(userId);
  const rank = await getUserRank(userId, 'all-time');
  const progressPercent = (profile.currentLevelXP / profile.xpToNextLevel) * 100;
  
  return {
    level: profile.level,
    title: profile.title,
    rank,
    totalXP: profile.totalXP,
    progressPercent: Math.round(progressPercent),
    recentAchievements: profile.achievements.slice(-3).reverse(),
    weeklyPoints: profile.weeklyPoints,
    achievementCount: profile.achievementCount
  };
};

export default {
  getOrCreateProfile,
  awardXP,
  trackActivity,
  getLeaderboard,
  getUserRank,
  getUserAchievements,
  getUserStats,
  resetWeeklyLeaderboard,
  resetMonthlyLeaderboard,
  awardBadge,
  getTopPerformers,
  getDashboardSummary
};