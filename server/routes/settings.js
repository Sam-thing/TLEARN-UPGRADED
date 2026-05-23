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

// ── Helper: get or create settings document for a user ───────────────────────────────────────────────
const getOrCreate = async (userId) => {
  let settings = await UserSettings.findOne({ user: userId });
  if (!settings) {
    // First time this user hits settings — create defaults silently
    settings = await UserSettings.create({ user: userId });
  }
  return settings;
};

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const settings = await getOrCreate(req.user._id);
    res.json({ settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    res.status(500).json({ message: 'Failed to load settings' });
  }
});

// PUT /api/settings
router.put('/', async (req, res) => {
  try {
    const settings = await getOrCreate(req.user._id);

    const { theme, language, voiceSpeed, feedbackDetail, notifications, privacy } = req.body;

    // Only update fields that were actually sent
    if (theme       && ['light','dark','system'].includes(theme))         settings.theme = theme;
    if (language    && ['en','es','fr','sw'].includes(language))          settings.language = language;
    if (voiceSpeed  && ['slow','normal','fast'].includes(voiceSpeed))     settings.voiceSpeed = voiceSpeed;
    if (feedbackDetail && ['brief','detailed','comprehensive'].includes(feedbackDetail))
      settings.feedbackDetail = feedbackDetail;
    if (notifications && typeof notifications === 'object')
      settings.notifications = { ...settings.notifications.toObject?.() ?? settings.notifications, ...notifications };
    if (privacy && typeof privacy === 'object')
      settings.privacy = { ...settings.privacy.toObject?.() ?? settings.privacy, ...privacy };

    await settings.save();
    res.json({ settings });
  } catch (error) {
    console.error('Settings PUT error:', error);
    res.status(500).json({ message: 'Failed to save settings' });
  }
});

// POST /api/settings/change-password
router.post('/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: 'Both passwords are required' });
    if (newPassword.length < 8)
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    if (oldPassword === newPassword)
      return res.status(400).json({ message: 'New password must differ from current password' });

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change-password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/settings/export
router.get('/export', async (req, res) => {
  try {
    const [user, settings, notes, sessions, topics] = await Promise.all([
      User.findById(req.user._id).select('-password'),
      getOrCreate(req.user._id),
      Note.find({ user: req.user._id }).populate('topic', 'name subject').lean(),
      Session.find({ user: req.user._id }).populate('topic', 'name subject').lean(),
      Topic.find({ createdBy: req.user._id }).lean(),
    ]);

    res.json({
      user: { name: user.name, email: user.email, createdAt: user.createdAt },
      settings,
      statistics: { totalNotes: notes.length, totalSessions: sessions.length, totalTopics: topics.length },
      notes,
      sessions,
      topics,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
});

// DELETE /api/settings/account
router.delete('/account', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password required to delete account' });

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    await Promise.all([
      User.findByIdAndDelete(req.user._id),
      UserSettings.deleteOne({ user: req.user._id }),
      Note.deleteMany({ user: req.user._id }),
      Session.deleteMany({ user: req.user._id }),
      Topic.deleteMany({ createdBy: req.user._id }),
    ]);

    res.json({ message: 'Account deleted' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;