// routes/progress.js
import { Router } from 'express';
import {
  getProgress, getStats,
  getDailyActivity, getTopicMastery
} from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/',         getProgress);
router.get('/stats',    getStats);
router.get('/activity', getDailyActivity);
router.get('/mastery',  getTopicMastery);

export default router;