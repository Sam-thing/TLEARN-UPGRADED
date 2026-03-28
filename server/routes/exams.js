// server/routes/exams.js
import { Router } from 'express';
import {
  createExam,
  generateExam,
  getExams,
  getExamById,
  startExam,
  submitExam,
  deleteExam,
  getExamStats
} from '../controllers/examsController.js';
import { protect } from '../middleware/auth.js';
 
const router = Router();
router.use(protect);
 
router.post('/', createExam);
router.post('/generate', generateExam);
router.get('/', getExams);
router.get('/stats', getExamStats);
router.get('/:id', getExamById);
router.post('/:id/start', startExam);
router.post('/:id/submit', submitExam);
router.delete('/:id', deleteExam);
 
export default router;