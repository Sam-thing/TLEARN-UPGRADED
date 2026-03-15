// server/models/UserSettings.js
import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Appearance
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'light'
  },
  language: {
    type: String,
    enum: ['en', 'es', 'fr', 'sw'],
    default: 'en'
  },

  // Learning Preferences
  voiceSpeed: {
    type: String,
    enum: ['slow', 'normal', 'fast'],
    default: 'normal'
  },
  feedbackDetail: {
    type: String,
    enum: ['brief', 'detailed', 'comprehensive'],
    default: 'detailed'
  },

  // Notifications
  notifications: {
    sessionReminders: { type: Boolean, default: true },
    goalAchievements: { type: Boolean, default: true },
    roomInvites: { type: Boolean, default: true },
    weeklyProgress: { type: Boolean, default: false },
    emailUpdates: { type: Boolean, default: true }
  },

  // Privacy
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'members', 'private'],
      default: 'public'
    },
    showProgress: { type: Boolean, default: true },
    allowRoomInvites: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Create default settings for new user
userSettingsSchema.statics.createDefaults = async function(userId) {
  return await this.create({ user: userId });
};

export default mongoose.model('UserSettings', userSettingsSchema);