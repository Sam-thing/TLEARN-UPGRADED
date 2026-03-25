// server/routes/sessions.js - Session Routes
import express from 'express';
import multer from 'multer';
import { catchAsync } from '../middleware/errorHandler.js';
import path from 'path';
import { protect } from '../middleware/auth.js';
import Session from '../models/Session.js';
import { createSession } from '../controllers/sessionsController.js';
import Topic from '../models/Topic.js';

const router = express.Router();

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploaded/sessions');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'session-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Get all sessions for current user
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id })
      .populate('topic', 'name subject difficulty')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stats for dashboard - MUST BE BEFORE /:id
router.get('/stats', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id })
      .select('feedback createdAt')
      .lean();

    // Calculate stats
    const totalSessions = sessions.length;
    const averageScore = totalSessions > 0 
      ? Math.round(sessions.reduce((sum, s) => sum + (s.feedback?.score || 0), 0) / totalSessions)
      : 0;

    // Calculate streak
    const sessionDates = [...new Set(
      sessions.map(s => new Date(s.createdAt).toISOString().split('T')[0])
    )].sort().reverse();

    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (sessionDates.length > 0 && (sessionDates[0] === today || sessionDates[0] === yesterday)) {
      currentStreak = 1;
      for (let i = 1; i < sessionDates.length; i++) {
        const currentDate = new Date(sessionDates[i]);
        const prevDate = new Date(sessionDates[i - 1]);
        const diffDays = Math.floor((prevDate - currentDate) / 86400000);
        if (diffDays === 1) currentStreak++;
        else break;
      }
    }

    res.json({
      totalSessions,
      averageScore,
      streak: { current: currentStreak },
      achievements: 0 // Placeholder for now
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent sessions - MUST BE BEFORE /:id
router.get('/recent', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const sessions = await Session.find({ user: req.user.id })
      .populate('topic', 'name subject')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching recent sessions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single session by ID - MUST BE AFTER /stats and /recent
router.get('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('topic', 'name subject difficulty description')
      .lean();

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check ownership
    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Create new session - USE THE CONTROLLER
router.post('/', protect, upload.single('audio'), catchAsync(async (req, res) => {
  return createSession(req, res);  
}));

// Delete session
router.delete('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check ownership
    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await session.deleteOne();

    res.json({ message: 'Session deleted' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sessions by topic
router.get('/topic/:topicId', protect, async (req, res) => {
  try {
    const sessions = await Session.find({
      user: req.user.id,
      topic: req.params.topicId
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching topic sessions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;