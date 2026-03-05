// controllers/progressController.js
import Session from '../models/Session.js';
import User    from '../models/User.js';
import { catchAsync } from '../middleware/errorHandler.js';

// GET /api/progress
export const getProgress = catchAsync(async (req, res) => {
  const user     = await User.findById(req.user._id);
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
      score:   s.feedback.score,
      date:    s.createdAt
    }));

  res.json({
    statistics: user.stats,
    streak:     user.streak,
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

// ── Helpers ────────────────────────────────────────────────────────────────

const buildDailyActivity = (sessions) => {
  const map = {};

  sessions.forEach((s) => {
    const key = s.createdAt.toISOString().split('T')[0];
    if (!map[key]) map[key] = { date: key, sessions: 0, totalScore: 0 };
    map[key].sessions   += 1;
    map[key].totalScore += s.feedback.score;
  });

  return Object.values(map)
    .map((d) => ({
      date:         d.date,
      sessions:     d.sessions,
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
        topic:              s.topic,
        sessionsCompleted:  0,
        totalScore:         0,
        bestScore:          0
      };
    }
    map[id].sessionsCompleted += 1;
    map[id].totalScore        += s.feedback.score;
    map[id].bestScore          = Math.max(map[id].bestScore, s.feedback.score);
  });

  return Object.values(map)
    .map((m) => ({
      topic:             m.topic,
      sessionsCompleted: m.sessionsCompleted,
      averageScore:      Math.round(m.totalScore / m.sessionsCompleted),
      bestScore:         m.bestScore,
      masteryLevel:      getMasteryLevel(Math.round(m.totalScore / m.sessionsCompleted))
    }))
    .sort((a, b) => b.averageScore - a.averageScore);
};

const getMasteryLevel = (avg) => {
  if (avg >= 90) return 'expert';
  if (avg >= 75) return 'advanced';
  if (avg >= 60) return 'intermediate';
  return 'beginner';
};