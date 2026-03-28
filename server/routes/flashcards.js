// server/routes/flashcards.js
import { Router } from 'express';
import {
  createFlashcard,
  generateFlashcards,
  getFlashcards,
  getDueFlashcards,
  getFlashcardById,
  reviewFlashcard,
  updateFlashcard,
  deleteFlashcard,
  getFlashcardStats
} from '../controllers/flashcardsController.js';
import { protect } from '../middleware/auth.js';
 
const router = Router();
router.use(protect);
 
router.post('/', createFlashcard);
router.post('/generate', generateFlashcards);
router.get('/', getFlashcards);
router.get('/due', getDueFlashcards);
router.get('/stats', getFlashcardStats);
router.get('/:id', getFlashcardById);
router.post('/:id/review', reviewFlashcard);
router.put('/:id', updateFlashcard);
router.delete('/:id', deleteFlashcard);
 
export default router;