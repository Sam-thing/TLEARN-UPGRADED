// server/controllers/gamificationController.js
import Gamification from '../models/Gamification.js';
import User from '../models/User.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { XP_REWARDS, checkAchievements } from '../config/achievements.js';

/**
 * GET /api/gamification
 * Get user's gamification profile
 */
export const getProfile = catchAsync(async (req, res) => {
  let profile = await Gamification.findOne({ user: req.user._id });
  
  if (!profile) {
    // Create profile if doesn't exist
    profile = await Gamification.create({
      user: req.user._id
    });
  }
  
  res.json({ profile });
});

/**
 * POST /api/gamification/xp
 * Award XP to user
 */
export const awardXP = catchAsync(async (req, res) => {
  const { amount, reason } = req.body;
  
  let profile = await Gamification.findOne({ user: req.user._id });
  
  if (!profile) {
    profile = await Gamification.create({ user: req.user._id });
  }
  
  const result = profile.addXP(amount);
  
  // Add to weekly and monthly points
  profile.weeklyPoints += amount;
  profile.monthlyPoints += amount;
  
  await profile.save();
  
  res.json({
    profile,
    ...result,
    message: `+${amount} XP! ${reason || ''}`
  });
});

/**
 * GET /api/gamification/leaderboard
 * Get leaderboard (weekly, monthly, all-time)
 */
export const getLeaderboard = catchAsync(async (req, res) => {
  const { type = 'weekly', limit = 100 } = req.query;
  
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
    .populate('user', 'name email')
    .sort(sortField)
    .limit(parseInt(limit))
    .lean();
  
  // Find current user's rank
  const userProfile = await Gamification.findOne({ user: req.user._id });
  let userRank = null;
  
  if (userProfile) {
    const allProfiles = await Gamification.find().sort(sortField);
    userRank = allProfiles.findIndex(p => p.user.toString() === req.user._id.toString()) + 1;
  }
  
  res.json({
    leaderboard: leaderboard.map((entry, index) => ({
      rank: index + 1,
      user: entry.user,
      level: entry.level,
      xp: entry.totalXP,
      weeklyPoints: entry.weeklyPoints,
      monthlyPoints: entry.monthlyPoints,
      title: entry.title,
      achievementCount: entry.achievementCount
    })),
    userRank,
    type
  });
});

/**
 * GET /api/gamification/achievements
 * Get all achievements (earned and available)
 */
export const getAchievements = catchAsync(async (req, res) => {
  const profile = await Gamification.findOne({ user: req.user._id });
  const user = await User.findById(req.user._id);
  
  if (!profile) {
    return res.json({ earned: [], available: [] });
  }
  
  // Check for new achievements
  const newAchievements = checkAchievements(profile, user.stats || {});
  
  // Award new achievements
  for (const achievement of newAchievements) {
    profile.awardAchievement(achievement);
  }
  
  if (newAchievements.length > 0) {
    await profile.save();
  }
  
  res.json({
    earned: profile.achievements,
    newAchievements: newAchievements.length > 0 ? newAchievements : undefined
  });
});

/**
 * POST /api/gamification/activity
 * Track activity and award XP
 */
export const trackActivity = catchAsync(async (req, res) => {
  const { activity, metadata } = req.body;
  
  let profile = await Gamification.findOne({ user: req.user._id });
  
  if (!profile) {
    profile = await Gamification.create({ user: req.user._id });
  }
  
  let xpAwarded = 0;
  
  // Award XP based on activity
  switch (activity) {
    case 'session_completed':
      profile.sessionsCompleted += 1;
      xpAwarded = XP_REWARDS.SESSION_COMPLETED;
      if (metadata?.duration) {
        profile.studyHours += metadata.duration / 60;
      }
      break;
      
    case 'exam_completed':
      profile.examsCompleted += 1;
      xpAwarded = XP_REWARDS.EXAM_COMPLETED;
      if (metadata?.passed) {
        xpAwarded += XP_REWARDS.EXAM_PASSED;
      }
      if (metadata?.score === 100) {
        xpAwarded += XP_REWARDS.EXAM_PERFECT;
      }
      break;
      
    case 'flashcard_reviewed':
      profile.flashcardsReviewed += 1;
      xpAwarded = XP_REWARDS.FLASHCARD_REVIEWED;
      if (metadata?.mastered) {
        xpAwarded += XP_REWARDS.FLASHCARD_MASTERED;
      }
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
  }
  
  // Add XP
  const result = profile.addXP(xpAwarded);
  profile.weeklyPoints += xpAwarded;
  profile.monthlyPoints += xpAwarded;
  
  await profile.save();
  
  // Check for new achievements
  const user = await User.findById(req.user._id);
  const newAchievements = checkAchievements(profile, user.stats || {});
  
  for (const achievement of newAchievements) {
    profile.awardAchievement(achievement);
  }
  
  if (newAchievements.length > 0) {
    await profile.save();
  }
  
  res.json({
    xpAwarded,
    ...result,
    newAchievements: newAchievements.length > 0 ? newAchievements : undefined,
    profile
  });
});

/**
 * GET /api/gamification/stats
 * Get detailed gamification stats
 */
export const getStats = catchAsync(async (req, res) => {
  const profile = await Gamification.findOne({ user: req.user._id });
  
  if (!profile) {
    return res.json({ stats: null });
  }
  
  // Calculate progress to next level
  const progressPercent = (profile.currentLevelXP / profile.xpToNextLevel) * 100;
  
  // Get user's rank
  const allProfiles = await Gamification.find().sort({ totalXP: -1 });
  const rank = allProfiles.findIndex(p => p.user.toString() === req.user._id.toString()) + 1;
  
  const stats = {
    level: profile.level,
    title: profile.title,
    totalXP: profile.totalXP,
    currentLevelXP: profile.currentLevelXP,
    xpToNextLevel: profile.xpToNextLevel,
    progressPercent: Math.round(progressPercent),
    rank,
    weeklyPoints: profile.weeklyPoints,
    monthlyPoints: profile.monthlyPoints,
    achievementCount: profile.achievementCount,
    sessionsCompleted: profile.sessionsCompleted,
    examsCompleted: profile.examsCompleted,
    flashcardsReviewed: profile.flashcardsReviewed,
    studyHours: Math.round(profile.studyHours * 10) / 10
  };
  
  res.json({ stats });
});

/**
 * POST /api/gamification/reset-weekly
 * Reset weekly leaderboard (run by cron job)
 */
export const resetWeeklyLeaderboard = catchAsync(async (req, res) => {
  await Gamification.updateMany({}, { weeklyPoints: 0, lastWeeklyReset: new Date() });
  res.json({ message: 'Weekly leaderboard reset' });
});

/**
 * POST /api/gamification/reset-monthly
 * Reset monthly leaderboard (run by cron job)
 */
export const resetMonthlyLeaderboard = catchAsync(async (req, res) => {
  await Gamification.updateMany({}, { monthlyPoints: 0, lastMonthlyReset: new Date() });
  res.json({ message: 'Monthly leaderboard reset' });
});

// Helper function to track session completion (can be called from sessionsController)
export const trackSessionCompletion = async (userId, sessionData) => {
  try {
    let profile = await Gamification.findOne({ user: userId });
    if (!profile) profile = await Gamification.create({ user: userId });

    profile.sessionsCompleted += 1;
    if (sessionData.duration) {
      profile.studyHours += sessionData.duration / 60;
    }

    const result = profile.addXP(XP_REWARDS.SESSION_COMPLETED);
    await profile.save();

    return result;
  } catch (err) {
    console.error('Gamification tracking error:', err);
  }
};