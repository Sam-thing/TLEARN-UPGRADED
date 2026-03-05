// controllers/notesController.js
import Note  from '../models/Note.js';
import Topic from '../models/Topic.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { generateStudyNotes } from '../services/claudeService.js';

// GET /api/notes
export const getNotes = catchAsync(async (req, res) => {
  const { type, search } = req.query;

  const filter = { user: req.user._id };
  if (type)   filter.type  = type;
  if (search) filter.$text = { $search: search };

  const notes = await Note.find(filter)
    .populate('topic', 'name subject')
    .sort({ createdAt: -1 });

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
export const generateNotes = catchAsync(async (req, res) => {
  const { topicId } = req.body;

  const topic = await Topic.findById(topicId);
  if (!topic) throw new AppError('Topic not found', 404);

  const generated = await generateStudyNotes({
    topicName:  topic.name,
    subject:    topic.subject,
    keyPoints:  topic.keyPoints
  });

  const note = await Note.create({
    user:          req.user._id,
    topic:         topicId,
    title:         generated.title,
    content:       generated.content,
    type:          'generated',
    generatedFrom: `AI-generated for: ${topic.name}`
  });

  res.status(201).json({ note });
});

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