// routes/notes.js
import { Router } from 'express';
import {
  getNotes, getNote, createNote,
  generateNotes, updateNote, deleteNote
} from '../controllers/notesController.js';
import { protect } from '../middleware/auth.js';
import Note from '../models/Note.js';

const router = Router();
router.use(protect);

router.get('/', getNotes);
router.post('/', createNote);
router.post('/generate', generateNotes);

// ✅ MOVE /tags BEFORE /:id
router.get('/tags', async (req, res) => {
  try {
    const tags = await Note.distinct('tags', { user: req.user.id });
    res.json({ tags: tags.filter(Boolean).sort() });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ NOW /:id comes AFTER /tags
router.get('/:id', getNote);

// ✅ PATCH /pin should also be BEFORE PUT /:id
router.patch('/:id/pin', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    note.isPinned = !note.isPinned;
    await note.save();
    
    res.json({ note });
  } catch (error) {
    console.error('Error toggling pin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /:id
router.put('/:id', async (req, res) => {
  try {
    const { title, content, tags } = req.body;
 
    const note = await Note.findById(req.params.id);
 
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
 
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
 
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
 
    const updatedNote = await note.save();
 
    res.json({ note: updatedNote }); // ← WRAP IN {note: ...}
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', deleteNote);

export default router;