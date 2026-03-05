// routes/notes.js
import { Router } from 'express';
import {
  getNotes, getNote, createNote,
  generateNotes, updateNote, deleteNote
} from '../controllers/notesController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get ('/',          getNotes);
router.post('/',          createNote);
router.post('/generate',  generateNotes);
router.get ('/:id',       getNote);
router.patch('/:id',      updateNote);
router.delete('/:id',     deleteNote);

export default router;