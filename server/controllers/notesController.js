// controllers/notesController.js
import Note  from '../models/Note.js';
import Topic from '../models/Topic.js';
import aiService from '../services/aiService.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { generateStudyNotes } from '../services/claudeService.js';

// GET /api/notes
export const getNotes = catchAsync(async (req, res) => {
  const { type, search, tags } = req.query;

  const filter = { user: req.user._id };
  if (type)   filter.type  = type;
  if (search) filter.$text = { $search: search };

  if (tags) {
    const tagArray = tags.split(',').map(t => t.trim());
    filter.tags = { $in: tagArray };
  }

  const notes = await Note.find(filter)
    .populate('topic', 'name subject')
    .sort({ isPinned: -1, createdAt: -1 });

  res.json({ notes });
});

// GET /api/notes/:id
export const getNote = catchAsync(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id })
    .populate('topic', 'name subject');
  if (!note) throw new AppError('Note not found', 404);
  res.json({ note });
});

// POST /api/notes
export const createNote = catchAsync(async (req, res) => {
  const { title, content, topicId, tags } = req.body;

  const note = await Note.create({
    user:    req.user._id,
    topic:   topicId || null,
    title, content, tags,
    type: 'custom'
  });

  res.status(201).json({ note });
});

// POST /api/notes/generate
export const generateNotes = async (req, res) => {
  try {
    const { topicId } = req.body;
    
    // Get topic
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    // Generate notes with AI
    const aiNotes = await aiService.generateNotes(topic.name, topic.subject);
    
    // Save to database
    const note = await Note.create({
      user: req.user._id,
      title: `${topic.name} - AI Generated`,
      content: aiNotes.content,
      type: 'generated',
      topic: topicId,
      tags: ['AI-generated', topic.subject]
    });
    
    res.status(201).json({ note, content: aiNotes.content });
  } catch (error) {
    console.error('Error generating notes:', error);
    res.status(500).json({ message: error.message || 'Failed to generate notes' });
  }
};

// PATCH /api/notes/:id
export const updateNote = catchAsync(async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!note) throw new AppError('Note not found', 404);
  res.json({ note });
});

// DELETE /api/notes/:id
export const deleteNote = catchAsync(async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!note) throw new AppError('Note not found', 404);
  res.json({ message: 'Note deleted' });
});