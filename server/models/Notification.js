// server/models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  type: {
    type: String,
    enum: [
      'session_completed',
      'goal_achieved',
      'room_invite',
      'weekly_progress',
      'achievement_unlocked',
      'room_message'
    ],
    required: true
  },

  title: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  // Optional data for the notification
  data: {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    achievementId: String,
    score: Number,
    url: String
  },

  read: {
    type: Boolean,
    default: false
  },

  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for fast queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(userId, type, title, message, data = {}) {
  return await this.create({
    user: userId,
    type,
    title,
    message,
    data
  });
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  return await this.save();
};

export default mongoose.model('Notification', notificationSchema);