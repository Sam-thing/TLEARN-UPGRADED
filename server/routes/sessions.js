// routes/sessions.js
import { Router } from 'express';
import {
  createSession, getSessions, getRecentSessions,
  getSessionStats, getSession, deleteSession
} from '../controllers/sessionsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get ('/',        getSessions);
router.post('/',        createSession);
router.get ('/recent',  getRecentSessions);
router.get ('/stats',   getSessionStats);
router.get ('/:id',     getSession);
router.delete('/:id',   deleteSession);

export default router;