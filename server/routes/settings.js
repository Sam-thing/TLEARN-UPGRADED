// server/routes/settings.js
import { Router } from 'express';
import UserSettings from '../models/UserSettings.js';
import User from '../models/User.js';
import Note from '../models/Note.js';
import Session from '../models/Session.js';
import Topic from '../models/Topic.js';
import { protect } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = Router();
router.use(protect);

// GET /api/settings - Get user settings
router.get('/', async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ user: req.user.id });
    
    // Create default settings if not exist
    if (!settings) {
      settings = await UserSettings.createDefaults(req.user.id);
    }
    
    res.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/settings - Update settings
router.put('/', async (req, res) => {
  try {
    const { theme, language, voiceSpeed, feedbackDetail, notifications, privacy } = req.body;
    
    let settings = await UserSettings.findOne({ user: req.user.id });
    
    if (!settings) {
      settings = await UserSettings.createDefaults(req.user.id);
    }
    
    // Update fields
    if (theme) settings.theme = theme;
    if (language) settings.language = language;
    if (voiceSpeed) settings.voiceSpeed = voiceSpeed;
    if (feedbackDetail) settings.feedbackDetail = feedbackDetail;
    if (notifications) settings.notifications = { ...settings.notifications, ...notifications };
    if (privacy) settings.privacy = { ...settings.privacy, ...privacy };
    
    await settings.save();
    
    res.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/settings/change-password - Change password
router.post('/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both old and new password' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/settings/export - Export user data
router.get('/export', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const settings = await UserSettings.findOne({ user: req.user.id });
    const notes = await Note.find({ user: req.user.id }).populate('topic', 'name subject');
    const sessions = await Session.find({ user: req.user.id }).populate('topic', 'name subject');
    const topics = await Topic.find({ createdBy: req.user.id });
    
    const exportData = {
      user: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      settings,
      statistics: {
        totalNotes: notes.length,
        totalSessions: sessions.length,
        totalTopics: topics.length
      },
      notes,
      sessions,
      topics,
      exportedAt: new Date().toISOString()
    };
    
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/settings/account - Delete account
router.delete('/account', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Please provide your password to confirm' });
    }
    
    // Verify password
    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }
    
    // Delete all user data
    await Promise.all([
      User.findByIdAndDelete(req.user.id),
      UserSettings.deleteOne({ user: req.user.id }),
      Note.deleteMany({ user: req.user.id }),
      Session.deleteMany({ user: req.user.id }),
      Topic.deleteMany({ createdBy: req.user.id })
    ]);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;