// server/services/notificationService.js
import Notification from '../models/Notification.js';
import UserSettings from '../models/UserSettings.js';
import { io } from '../server.js'; // Import io from server

class NotificationService {
  // Check if user has notification type enabled
  async isNotificationEnabled(userId, notificationType) {
    try {
      const settings = await UserSettings.findOne({ user: userId });
      
      if (!settings) return true; // Default to enabled
      
      const typeMap = {
        'session_completed': 'sessionReminders',
        'goal_achieved': 'goalAchievements',
        'room_invite': 'roomInvites',
        'weekly_progress': 'weeklyProgress'
      };
      
      const settingKey = typeMap[notificationType];
      return settingKey ? settings.notifications[settingKey] : true;
    } catch (error) {
      return true; // Default to enabled on error
    }
  }

  // Create and send notification
  async send(userId, type, title, message, data = {}) {
    try {
      // Check if user has this notification type enabled
      const isEnabled = await this.isNotificationEnabled(userId, type);
      
      if (!isEnabled) {
        console.log(`Notification ${type} skipped for user ${userId} (disabled in settings)`);
        return null;
      }
      
      // Create notification
      const notification = await Notification.create({
        user: userId,
        type,
        title,
        message,
        data
      });
      
      // Send via Socket.io if user is connected
      io.to(userId.toString()).emit('notification', notification);
      
      console.log(`✉️ Notification sent to user ${userId}: ${title}`);
      
      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  // Helper methods for specific notification types
  
  async sessionCompleted(userId, sessionId, score, topicName) {
    return await this.send(
      userId,
      'session_completed',
      '🎯 Teaching Session Complete!',
      `You scored ${score}% on "${topicName}". View your feedback now!`,
      { sessionId, score, url: `/sessions/${sessionId}` }
    );
  }

  async goalAchieved(userId, goalName, achievementId) {
    return await this.send(
      userId,
      'goal_achieved',
      '🏆 Goal Achieved!',
      `Congratulations! You've achieved: ${goalName}`,
      { achievementId, url: '/progress' }
    );
  }

  async roomInvite(userId, roomId, roomName, inviterName) {
    return await this.send(
      userId,
      'room_invite',
      '📬 Study Room Invite',
      `${inviterName} invited you to join "${roomName}"`,
      { roomId, url: `/rooms/${roomId}` }
    );
  }

  async weeklyProgress(userId) {
    return await this.send(
      userId,
      'weekly_progress',
      '📊 Weekly Progress Report Ready',
      `Your learning summary for this week is ready to view!`,
      { url: '/progress' }
    );
  }

  async achievementUnlocked(userId, achievementTitle, achievementId) {
    return await this.send(
      userId,
      'achievement_unlocked',
      '✨ Achievement Unlocked!',
      achievementTitle,
      { achievementId, url: '/progress' }
    );
  }

  async roomMessage(userId, roomId, roomName, senderName, messagePreview) {
    return await this.send(
      userId,
      'room_message',
      `💬 New message in ${roomName}`,
      `${senderName}: ${messagePreview}`,
      { roomId, url: `/rooms/${roomId}` }
    );
  }
}

export default new NotificationService();