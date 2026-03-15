// server/routes/progress.js - Progress & Analytics Routes
import express from 'express';
import { protect } from '../middleware/auth.js';
import Session from '../models/Session.js';
import Topic from '../models/Topic.js';

const router = express.Router();

// GET /api/progress - Main progress dashboard data
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all user sessions
    const sessions = await Session.find({ user: userId })
      .populate('topic', 'name subject difficulty')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate statistics
    const statistics = calculateStatistics(sessions);
    
    // Calculate streak
    const streak = calculateStreak(sessions);
    
    // Get recent sessions (last 10)
    const recentSessions = sessions.slice(0, 10);
    
    // Calculate topic mastery
    const topicMastery = calculateTopicMastery(sessions);
    
    // Get achievements
    const achievements = generateAchievements(statistics, streak);
    
    // Get goals
    const goals = generateGoals(statistics, streak);

    res.json({
      statistics,
      streak,
      recentSessions,
      topicMastery,
      achievements,
      goals
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper: Calculate statistics
function calculateStatistics(sessions) {
  const totalSessions = sessions.length;
  
  if (totalSessions === 0) {
    return {
      totalSessions: 0,
      averageScore: 0,
      totalStudyTime: 0,
      topicsExplored: 0,
      averageAccuracy: 0,
      averageClarity: 0,
      averageConfidence: 0
    };
  }

  // Calculate averages
  const totalScore = sessions.reduce((sum, s) => sum + (s.feedback?.score || 0), 0);
  const totalAccuracy = sessions.reduce((sum, s) => sum + (s.feedback?.accuracyScore || 0), 0);
  const totalClarity = sessions.reduce((sum, s) => sum + (s.feedback?.clarityScore || 0), 0);
  const totalConfidence = sessions.reduce((sum, s) => sum + (s.feedback?.confidenceScore || 0), 0);
  const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

  // Count unique topics
  const uniqueTopics = new Set(sessions.map(s => s.topic?._id?.toString()).filter(Boolean));

  return {
    totalSessions,
    averageScore: Math.round(totalScore / totalSessions),
    averageAccuracy: Math.round(totalAccuracy / totalSessions),
    averageClarity: Math.round(totalClarity / totalSessions),
    averageConfidence: Math.round(totalConfidence / totalSessions),
    totalStudyTime: totalTime, // in seconds
    topicsExplored: uniqueTopics.size
  };
}

// Helper: Calculate learning streak
function calculateStreak(sessions) {
  if (sessions.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Sort sessions by date
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Get unique dates
  const sessionDates = [...new Set(
    sortedSessions.map(s => new Date(s.createdAt).toISOString().split('T')[0])
  )].sort().reverse();

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Check if streak is active (today or yesterday)
  if (sessionDates[0] === today || sessionDates[0] === yesterday) {
    currentStreak = 1;
    
    for (let i = 1; i < sessionDates.length; i++) {
      const currentDate = new Date(sessionDates[i]);
      const prevDate = new Date(sessionDates[i - 1]);
      const diffDays = Math.floor((prevDate - currentDate) / 86400000);
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < sessionDates.length; i++) {
    const currentDate = new Date(sessionDates[i]);
    const prevDate = new Date(sessionDates[i - 1]);
    const diffDays = Math.floor((prevDate - currentDate) / 86400000);
    
    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    current: currentStreak,
    longest: longestStreak
  };
}

// Helper: Calculate topic mastery
function calculateTopicMastery(sessions) {
  const topicStats = {};

  sessions.forEach(session => {
    if (!session.topic) return;

    const topicId = session.topic._id.toString();
    
    if (!topicStats[topicId]) {
      topicStats[topicId] = {
        topic: session.topic,
        sessionsCompleted: 0,
        totalScore: 0,
        averageScore: 0
      };
    }

    topicStats[topicId].sessionsCompleted++;
    topicStats[topicId].totalScore += (session.feedback?.score || 0);
  });

  // Calculate averages and sort
  const topicMastery = Object.values(topicStats).map(stat => ({
    ...stat,
    averageScore: Math.round(stat.totalScore / stat.sessionsCompleted)
  }));

  // Sort by average score, then by sessions completed
  topicMastery.sort((a, b) => {
    if (b.averageScore !== a.averageScore) {
      return b.averageScore - a.averageScore;
    }
    return b.sessionsCompleted - a.sessionsCompleted;
  });

  return topicMastery;
}

// Helper: Generate achievements
function generateAchievements(stats, streak) {
  return [
    {
      id: 'first-session',
      title: 'Quick Learner',
      description: 'Completed first session',
      icon: 'Trophy',
      earned: stats.totalSessions >= 1
    },
    {
      id: 'consistency',
      title: 'Consistency Champion',
      description: '7+ day streak',
      icon: 'Flame',
      earned: streak.current >= 7
    },
    {
      id: 'session-master',
      title: 'Session Master',
      description: '10+ sessions completed',
      icon: 'Award',
      earned: stats.totalSessions >= 10
    },
    {
      id: 'high-achiever',
      title: 'High Achiever',
      description: '80%+ average score',
      icon: 'Star',
      earned: stats.averageScore >= 80
    },
    {
      id: 'topic-explorer',
      title: 'Topic Explorer',
      description: 'Explored 5+ topics',
      icon: 'Brain',
      earned: stats.topicsExplored >= 5
    },
    {
      id: 'dedicated',
      title: 'Dedicated Learner',
      description: '25+ sessions completed',
      icon: 'Target',
      earned: stats.totalSessions >= 25
    }
  ];
}

// Helper: Generate goals
function generateGoals(stats, streak) {
  return [
    {
      id: 'sessions-50',
      goal: 'Complete 50 sessions',
      target: 50,
      current: stats.totalSessions,
      custom: false
    },
    {
      id: 'score-90',
      goal: 'Achieve 90% average score',
      target: 90,
      current: stats.averageScore,
      custom: false
    },
    {
      id: 'streak-30',
      goal: 'Maintain 30-day streak',
      target: 30,
      current: streak.current,
      custom: false
    },
    {
      id: 'topics-10',
      goal: 'Explore 10 different topics',
      target: 10,
      current: stats.topicsExplored,
      custom: false
    }
  ];
}

// GET /api/progress/stats - Just statistics (lighter endpoint)
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await Session.find({ user: userId })
      .select('feedback duration createdAt')
      .lean();

    const statistics = calculateStatistics(sessions);
    const streak = calculateStreak(sessions);

    res.json({ statistics, streak });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;