// server/config/achievements.js

export const ACHIEVEMENTS = {
  // Session Achievements
  FIRST_SESSION: {
    id: 'first_session',
    title: 'First Steps',
    description: 'Complete your first teaching session',
    icon: '🎯',
    category: 'sessions',
    tier: 'bronze',
    xpReward: 50,
    condition: (stats) => stats.sessionsCompleted >= 1
  },
  
  SESSIONS_10: {
    id: 'sessions_10',
    title: 'Getting Started',
    description: 'Complete 10 teaching sessions',
    icon: '📚',
    category: 'sessions',
    tier: 'bronze',
    xpReward: 100,
    condition: (stats) => stats.sessionsCompleted >= 10
  },
  
  SESSIONS_50: {
    id: 'sessions_50',
    title: 'Dedicated Learner',
    description: 'Complete 50 teaching sessions',
    icon: '⭐',
    category: 'sessions',
    tier: 'silver',
    xpReward: 250,
    condition: (stats) => stats.sessionsCompleted >= 50
  },
  
  SESSIONS_100: {
    id: 'sessions_100',
    title: 'Century Club',
    description: 'Complete 100 teaching sessions',
    icon: '💯',
    category: 'sessions',
    tier: 'gold',
    xpReward: 500,
    condition: (stats) => stats.sessionsCompleted >= 100
  },
  
  SESSIONS_500: {
    id: 'sessions_500',
    title: 'Teaching Master',
    description: 'Complete 500 teaching sessions',
    icon: '👑',
    category: 'sessions',
    tier: 'platinum',
    xpReward: 1000,
    condition: (stats) => stats.sessionsCompleted >= 500
  },
  
  // Exam Achievements
  FIRST_EXAM: {
    id: 'first_exam',
    title: 'Test Taker',
    description: 'Complete your first exam',
    icon: '📝',
    category: 'exams',
    tier: 'bronze',
    xpReward: 50,
    condition: (stats) => stats.examsCompleted >= 1
  },
  
  PERFECT_EXAM: {
    id: 'perfect_exam',
    title: 'Perfect Score',
    description: 'Score 100% on an exam',
    icon: '🎖️',
    category: 'exams',
    tier: 'gold',
    xpReward: 300,
    condition: (stats) => stats.perfectExams >= 1
  },
  
  EXAMS_10: {
    id: 'exams_10',
    title: 'Exam Expert',
    description: 'Complete 10 exams',
    icon: '🏆',
    category: 'exams',
    tier: 'silver',
    xpReward: 200,
    condition: (stats) => stats.examsCompleted >= 10
  },
  
  // Flashcard Achievements
  FIRST_REVIEW: {
    id: 'first_review',
    title: 'Memory Master Initiate',
    description: 'Complete your first flashcard review',
    icon: '🧠',
    category: 'flashcards',
    tier: 'bronze',
    xpReward: 50,
    condition: (stats) => stats.flashcardsReviewed >= 1
  },
  
  FLASHCARDS_100: {
    id: 'flashcards_100',
    title: 'Card Collector',
    description: 'Review 100 flashcards',
    icon: '🃏',
    category: 'flashcards',
    tier: 'silver',
    xpReward: 150,
    condition: (stats) => stats.flashcardsReviewed >= 100
  },
  
  FLASHCARDS_1000: {
    id: 'flashcards_1000',
    title: 'Memory Champion',
    description: 'Review 1000 flashcards',
    icon: '🏅',
    category: 'flashcards',
    tier: 'gold',
    xpReward: 500,
    condition: (stats) => stats.flashcardsReviewed >= 1000
  },
  
  // Streak Achievements
  STREAK_7: {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day study streak',
    icon: '🔥',
    category: 'streak',
    tier: 'bronze',
    xpReward: 100,
    condition: (stats) => stats.currentStreak >= 7
  },
  
  STREAK_30: {
    id: 'streak_30',
    title: 'Monthly Marvel',
    description: 'Maintain a 30-day study streak',
    icon: '🌟',
    category: 'streak',
    tier: 'silver',
    xpReward: 300,
    condition: (stats) => stats.currentStreak >= 30
  },
  
  STREAK_100: {
    id: 'streak_100',
    title: 'Unstoppable Force',
    description: 'Maintain a 100-day study streak',
    icon: '💪',
    category: 'streak',
    tier: 'gold',
    xpReward: 1000,
    condition: (stats) => stats.currentStreak >= 100
  },
  
  STREAK_365: {
    id: 'streak_365',
    title: 'Year of Dedication',
    description: 'Maintain a 365-day study streak',
    icon: '👑',
    category: 'streak',
    tier: 'platinum',
    xpReward: 5000,
    condition: (stats) => stats.currentStreak >= 365
  },
  
  // Special Achievements
  EARLY_BIRD: {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a session before 8 AM',
    icon: '🌅',
    category: 'special',
    tier: 'bronze',
    xpReward: 50,
    condition: (stats) => stats.earlyBirdSessions >= 1
  },
  
  NIGHT_OWL: {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a session after 10 PM',
    icon: '🦉',
    category: 'special',
    tier: 'bronze',
    xpReward: 50,
    condition: (stats) => stats.nightOwlSessions >= 1
  },
  
  SPEED_DEMON: {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete 5 sessions in one day',
    icon: '⚡',
    category: 'special',
    tier: 'silver',
    xpReward: 200,
    condition: (stats) => stats.maxSessionsInDay >= 5
  },
  
  MARATHON: {
    id: 'marathon',
    title: 'Study Marathon',
    description: 'Study for 5+ hours in one day',
    icon: '🏃',
    category: 'special',
    tier: 'gold',
    xpReward: 300,
    condition: (stats) => stats.maxStudyHoursInDay >= 5
  },
  
  // Social Achievements
  HELPFUL: {
    id: 'helpful',
    title: 'Helpful Hand',
    description: 'Help 10 other students',
    icon: '🤝',
    category: 'social',
    tier: 'silver',
    xpReward: 150,
    condition: (stats) => stats.helpedOthers >= 10
  },
  
  GROUP_LEADER: {
    id: 'group_leader',
    title: 'Group Leader',
    description: 'Create and complete 5 group study sessions',
    icon: '👥',
    category: 'social',
    tier: 'gold',
    xpReward: 250,
    condition: (stats) => stats.groupSessionsLed >= 5
  }
};

// XP Rewards for different activities
export const XP_REWARDS = {
  SESSION_COMPLETED: 10,
  EXAM_COMPLETED: 20,
  EXAM_PASSED: 30,
  EXAM_PERFECT: 100,
  FLASHCARD_REVIEWED: 2,
  FLASHCARD_MASTERED: 5,
  DAILY_GOAL_MET: 25,
  STREAK_CONTINUED: 15,
  HELP_ANOTHER_USER: 10,
  GROUP_SESSION_COMPLETED: 20
};

// Check which achievements user has earned
export const checkAchievements = (gamification, userStats) => {
  const newAchievements = [];
  
  // Combine stats
  const stats = {
    sessionsCompleted: gamification.sessionsCompleted,
    examsCompleted: gamification.examsCompleted,
    flashcardsReviewed: gamification.flashcardsReviewed,
    currentStreak: userStats.streak?.current || 0,
    perfectExams: userStats.perfectExams || 0,
    earlyBirdSessions: userStats.earlyBirdSessions || 0,
    nightOwlSessions: userStats.nightOwlSessions || 0,
    maxSessionsInDay: userStats.maxSessionsInDay || 0,
    maxStudyHoursInDay: userStats.maxStudyHoursInDay || 0,
    helpedOthers: gamification.helpedOthers,
    groupSessionsLed: userStats.groupSessionsLed || 0
  };
  
  // Check each achievement
  for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
    // Skip if already unlocked
    const hasAchievement = gamification.achievements.find(a => a.id === achievement.id);
    if (hasAchievement) continue;
    
    // Check if condition is met
    if (achievement.condition(stats)) {
      newAchievements.push(achievement);
    }
  }
  
  return newAchievements;
};