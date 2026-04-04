// server/controllers/gamificationController.js
import { catchAsync } from '../middleware/errorHandler.js';
import gamificationService from '../services/gamificationService.js';

/**
 * GET /api/gamification
 * Get user's gamification profile
 */
export const getProfile = catchAsync(async (req, res) => {
  const profile = await gamificationService.getOrCreateProfile(req.user._id);
  res.json({ profile });
});

/**
 * POST /api/gamification/xp
 * Award XP to user
 */
export const awardXP = catchAsync(async (req, res) => {
  const { amount, reason } = req.body;
  
  const result = await gamificationService.awardXP(req.user._id, amount, reason);
  
  res.json(result);
});

/**
 * GET /api/gamification/leaderboard
 * Get leaderboard (weekly, monthly, all-time, level)
 */
export const getLeaderboard = catchAsync(async (req, res) => {
  const { type = 'weekly', limit = 100 } = req.query;
  
  const leaderboard = await gamificationService.getLeaderboard(type, parseInt(limit));
  const userRank = await gamificationService.getUserRank(req.user._id, type);
  
  res.json({
    leaderboard,
    userRank,
    type
  });
});

/**
 * GET /api/gamification/achievements
 * Get all achievements (earned and new)
 */
export const getAchievements = catchAsync(async (req, res) => {
  const result = await gamificationService.getUserAchievements(req.user._id);
  res.json(result);
});

/**
 * POST /api/gamification/activity
 * Track activity and award XP
 */
export const trackActivity = catchAsync(async (req, res) => {
  const { activity, metadata } = req.body;
  
  const result = await gamificationService.trackActivity(
    req.user._id,
    activity,
    metadata
  );
  
  res.json(result);
});

/**
 * GET /api/gamification/stats
 * Get detailed gamification stats
 */
export const getStats = catchAsync(async (req, res) => {
  const stats = await gamificationService.getUserStats(req.user._id);
  res.json({ stats });
});

/**
 * GET /api/gamification/dashboard
 * Get gamification summary for dashboard
 */
export const getDashboardSummary = catchAsync(async (req, res) => {
  const summary = await gamificationService.getDashboardSummary(req.user._id);
  res.json({ summary });
});

/**
 * GET /api/gamification/top-performers
 * Get top performers
 */
export const getTopPerformers = catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;
  const topPerformers = await gamificationService.getTopPerformers(parseInt(limit));
  res.json(topPerformers);
});

/**
 * POST /api/gamification/badge
 * Award badge to user
 */
export const awardBadge = catchAsync(async (req, res) => {
  const { badgeId, badgeName } = req.body;
  
  const result = await gamificationService.awardBadge(
    req.user._id,
    badgeId,
    badgeName
  );
  
  res.json(result);
});

/**
 * POST /api/gamification/reset-weekly
 * Reset weekly leaderboard (admin/cron only)
 */
export const resetWeeklyLeaderboard = catchAsync(async (req, res) => {
  const result = await gamificationService.resetWeeklyLeaderboard();
  res.json(result);
});

/**
 * POST /api/gamification/reset-monthly
 * Reset monthly leaderboard (admin/cron only)
 */
export const resetMonthlyLeaderboard = catchAsync(async (req, res) => {
  const result = await gamificationService.resetMonthlyLeaderboard();
  res.json(result);
});