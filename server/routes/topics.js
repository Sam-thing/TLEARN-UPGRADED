// routes/topics.js
import { Router } from 'express';
import {
  getTopics, getPopularTopics, getRecommendedTopics,
  getTopic, createTopic, updateTopic, deleteTopic, getPrepNotes
} from '../controllers/topicsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get ('/',              getTopics);
router.get ('/popular',       getPopularTopics);
router.get ('/recommended',   getRecommendedTopics);
router.get ('/:id',           getTopic);
router.post('/',              createTopic);
router.patch('/:id',          updateTopic);
router.delete('/:id',         deleteTopic);
router.post ('/:id/prep-notes', getPrepNotes);

export default router;