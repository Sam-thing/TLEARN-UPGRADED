// controllers/progressController.js - WITH NOTIFICATIONS
import Session from '../models/Session.js';
import User from '../models/User.js';
import Goal from '../models/Goal.js';  // ← Add this if you have a Goal model
import notificationService from '../services/notificationService.js';
import { catchAsync } from '../middleware/errorHandler.js';

// GET /api/progress
export const getProgress = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  const sessions = await Session.find({ user: req.user._id, status: 'analyzed' })
    .populate('topic', 'name subject')
    .sort({ createdAt: -1 });

  // Daily activity — last 30 days
  const dailyActivity = buildDailyActivity(sessions);

  // Topic mastery
  const topicMastery = buildTopicMastery(sessions);

  // Score evolution
  const scoreEvolution = sessions
    .slice()
    .reverse()
    .map((s, i) => ({
      session: i + 1,
      score: s.feedback.score,
      date: s.createdAt
    }));

  res.json({
    statistics: user.stats,
    streak: user.streak,
    dailyActivity,
    topicMastery,
    scoreEvolution,
    recentSessions: sessions.slice(0, 10)
  });
});

// GET /api/progress/stats
export const getStats = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ statistics: user.stats, streak: user.streak });
});

// GET /api/progress/activity
export const getDailyActivity = catchAsync(async (req, res) => {
  const sessions = await Session.find({ user: req.user._id, status: 'analyzed' });
  const activity = buildDailyActivity(sessions);
  res.json({ activity });
});

// GET /api/progress/mastery
export const getTopicMastery = catchAsync(async (req, res) => {
  const sessions = await Session.find({ user: req.user._id, status: 'analyzed' })
    .populate('topic', 'name subject');
  const mastery = buildTopicMastery(sessions);
  res.json({ mastery });
});

// ✅ POST /api/progress/goals - Create goal
export const createGoal = catchAsync(async (req, res) => {
  const goal = await Goal.create({
    user: req.user._id,
    ...req.body
  });
  
  res.status(201).json({ goal });
});

// ✅ PUT /api/progress/goals/:id - Update goal (with achievement notification)
export const updateGoal = catchAsync(async (req, res) => {
  const oldGoal = await Goal.findById(req.params.id);
  
  const goal = await Goal.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  // ✅ SEND NOTIFICATION when goal is completed
  if (goal.completed && !oldGoal.completed) {
    await notificationService.goalAchieved(
      req.user._id,
      goal.title,
      goal._id
    );
    console.log('✉️ Goal achievement notification sent');
  }
  
  res.json({ goal });
});

// ✅ DELETE /api/progress/goals/:id - Delete goal
export const deleteGoal = catchAsync(async (req, res) => {
  await Goal.findByIdAndDelete(req.params.id);
  res.json({ message: 'Goal deleted' });
});

// ✅ CHECK MILESTONES - Call this after session creation
export const checkMilestones = async (userId) => {
  try {
    const user = await User.findById(userId);
    const sessions = await Session.find({ user: userId, status: 'analyzed' });
    
    // Check for milestone achievements
    const milestones = [
      { count: 1, title: '🎯 First Session Complete!' },
      { count: 5, title: '🔥 5 Sessions Milestone!' },
      { count: 10, title: '⭐ 10 Sessions Achieved!' },
      { count: 25, title: '💪 25 Sessions - You\'re on fire!' },
      { count: 50, title: '🏆 50 Sessions - Master Learner!' },
      { count: 100, title: '👑 100 Sessions - Teaching Legend!' }
    ];
    
    const sessionCount = sessions.length;
    const milestone = milestones.find(m => m.count === sessionCount);
    
    if (milestone) {
      await notificationService.achievementUnlocked(
        userId,
        milestone.title,
        `milestone_${milestone.count}`
      );
      console.log(`✉️ Milestone notification sent: ${milestone.title}`);
    }
    
    // Check for streak achievements
    if (user.streak.current === 7) {
      await notificationService.achievementUnlocked(
        userId,
        '🔥 7-Day Streak!',
        'streak_7'
      );
    } else if (user.streak.current === 30) {
      await notificationService.achievementUnlocked(
        userId,
        '🔥 30-Day Streak - Unstoppable!',
        'streak_30'
      );
    }
  } catch (error) {
    console.error('Error checking milestones:', error);
  }
};

// ── Helpers ────────────────────────────────────────────────────────────────

const buildDailyActivity = (sessions) => {
  const map = {};

  sessions.forEach((s) => {
    const key = s.createdAt.toISOString().split('T')[0];
    if (!map[key]) map[key] = { date: key, sessions: 0, totalScore: 0 };
    map[key].sessions += 1;
    map[key].totalScore += s.feedback.score;
  });

  return Object.values(map)
    .map((d) => ({
      date: d.date,
      sessions: d.sessions,
      averageScore: Math.round(d.totalScore / d.sessions)
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30); // last 30 days
};

const buildTopicMastery = (sessions) => {
  const map = {};

  sessions.forEach((s) => {
    if (!s.topic) return;
    const id = s.topic._id.toString();
    if (!map[id]) {
      map[id] = {
        topic: s.topic,
        sessionsCompleted: 0,
        totalScore: 0,
        bestScore: 0
      };
    }
    map[id].sessionsCompleted += 1;
    map[id].totalScore += s.feedback.score;
    map[id].bestScore = Math.max(map[id].bestScore, s.feedback.score);
  });

  return Object.values(map)
    .map((m) => ({
      topic: m.topic,
      sessionsCompleted: m.sessionsCompleted,
      averageScore: Math.round(m.totalScore / m.sessionsCompleted),
      bestScore: m.bestScore,
      masteryLevel: getMasteryLevel(Math.round(m.totalScore / m.sessionsCompleted))
    }))
    .sort((a, b) => b.averageScore - a.averageScore);
};

const getMasteryLevel = (avg) => {
  if (avg >= 90) return 'expert';
  if (avg >= 75) return 'advanced';
  if (avg >= 60) return 'intermediate';
  return 'beginner';
};

export { checkMilestones };
```

// **Then in your sessions controller, call checkMilestones:**

// // In sessionsController.js
// import { checkMilestones } from './progressController.js';

// export const createSession = catchAsync(async (req, res) => {
//   // ... create session
  
//   // Check for milestone achievements
//   await checkMilestones(req.user._id);
  
//   res.status(201).json({ session });
// });
// ```