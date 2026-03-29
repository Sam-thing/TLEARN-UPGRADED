// server/models/Gamification.js
import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  icon: String,
  category: {
    type: String,
    enum: ['sessions', 'exams', 'flashcards', 'streak', 'social', 'special'],
    default: 'sessions'
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  xpReward: {
    type: Number,
    default: 100
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  }
});

const gamificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // XP & Level System
  totalXP: {
    type: Number,
    default: 0,
    index: true
  },
  level: {
    type: Number,
    default: 1,
    index: true
  },
  currentLevelXP: {
    type: Number,
    default: 0
  },
  xpToNextLevel: {
    type: Number,
    default: 100
  },
  
  // Points & Ranking
  weeklyPoints: {
    type: Number,
    default: 0,
    index: true
  },
  monthlyPoints: {
    type: Number,
    default: 0
  },
  allTimePoints: {
    type: Number,
    default: 0
  },
  
  // Achievements
  achievements: [achievementSchema],
  achievementCount: {
    type: Number,
    default: 0
  },
  
  // Badges
  badges: [{
    id: String,
    name: String,
    earnedAt: Date
  }],
  
  // Activity Stats
  sessionsCompleted: {
    type: Number,
    default: 0
  },
  examsCompleted: {
    type: Number,
    default: 0
  },
  flashcardsReviewed: {
    type: Number,
    default: 0
  },
  studyHours: {
    type: Number,
    default: 0
  },
  
  // Social Stats
  studyGroups: {
    type: Number,
    default: 0
  },
  helpedOthers: {
    type: Number,
    default: 0
  },
  
  // Streaks
  longestStreak: {
    type: Number,
    default: 0
  },
  perfectDays: {
    type: Number,
    default: 0
  },
  
  // Title/Rank
  title: {
    type: String,
    default: 'Beginner'
  },
  
  // Last reset dates
  lastWeeklyReset: Date,
  lastMonthlyReset: Date
}, {
  timestamps: true
});

// Calculate XP needed for next level (exponential growth)
gamificationSchema.methods.calculateXPForLevel = function(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Add XP and check for level up
gamificationSchema.methods.addXP = function(amount) {
  this.totalXP += amount;
  this.currentLevelXP += amount;
  this.allTimePoints += amount;
  
  // Check for level up
  while (this.currentLevelXP >= this.xpToNextLevel) {
    this.currentLevelXP -= this.xpToNextLevel;
    this.level += 1;
    this.xpToNextLevel = this.calculateXPForLevel(this.level + 1);
    
    // Update title based on level
    this.updateTitle();
  }
  
  return {
    leveledUp: this.isModified('level'),
    newLevel: this.level,
    xpGained: amount
  };
};

// Update user title based on level
gamificationSchema.methods.updateTitle = function() {
  if (this.level >= 50) this.title = 'Master Scholar';
  else if (this.level >= 40) this.title = 'Expert Learner';
  else if (this.level >= 30) this.title = 'Advanced Student';
  else if (this.level >= 20) this.title = 'Dedicated Learner';
  else if (this.level >= 10) this.title = 'Enthusiastic Student';
  else if (this.level >= 5) this.title = 'Eager Learner';
  else this.title = 'Beginner';
};

// Award achievement
gamificationSchema.methods.awardAchievement = function(achievement) {
  const exists = this.achievements.find(a => a.id === achievement.id);
  if (exists) return false;
  
  this.achievements.push(achievement);
  this.achievementCount += 1;
  this.addXP(achievement.xpReward || 100);
  
  return true;
};

// Reset weekly points
gamificationSchema.methods.resetWeeklyPoints = function() {
  this.weeklyPoints = 0;
  this.lastWeeklyReset = new Date();
};

// Reset monthly points
gamificationSchema.methods.resetMonthlyPoints = function() {
  this.monthlyPoints = 0;
  this.lastMonthlyReset = new Date();
};

// Index for leaderboards
gamificationSchema.index({ weeklyPoints: -1 });
gamificationSchema.index({ totalXP: -1 });
gamificationSchema.index({ level: -1 });

const Gamification = mongoose.model('Gamification', gamificationSchema);

export default Gamification;