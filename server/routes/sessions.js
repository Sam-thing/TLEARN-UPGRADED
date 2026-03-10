// routes/sessions.js
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  createSession, getSessions, getRecentSessions,
  getSessionStats, getSession, deleteSession
} from '../controllers/sessionsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploaded/'); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'session-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

router.get ('/',        getSessions);
router.post('/',        upload.single('audio'), createSession);
router.get ('/recent',  getRecentSessions);
router.get ('/stats',   getSessionStats);
router.get ('/:id',     getSession);
router.delete('/:id',   deleteSession);

export default router;