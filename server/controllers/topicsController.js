// controllers/topicsController.js
import Topic from '../models/Topic.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { generatePrepNotes } from '../services/claudeService.js';

// GET /api/topics
export const getTopics = catchAsync(async (req, res) => {
  const { subject, difficulty, search, page = 1, limit = 20 } = req.query;

  const filter = { isPublic: true };
  if (subject)    filter.subject    = new RegExp(subject, 'i');
  if (difficulty) filter.difficulty = difficulty;
  if (search)     filter.$text      = { $search: search };

  const topics = await Topic.find(filter)
    .sort({ 'stats.popularity': -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Topic.countDocuments(filter);

  res.json({ topics, total, page: Number(page) });
});

// GET /api/topics/popular
export const getPopularTopics = catchAsync(async (req, res) => {
  const topics = await Topic.find({ isPublic: true })
    .sort({ 'stats.popularity': -1 })
    .limit(6);
  res.json({ topics });
});

// GET /api/topics/recommended
export const getRecommendedTopics = catchAsync(async (req, res) => {
  // Simple recommendation: popular topics the user hasn't done yet
  // Can be made smarter later with session history
  const topics = await Topic.find({ isPublic: true })
    .sort({ 'stats.popularity': -1 })
    .limit(10);
  res.json({ topics });
});

// GET /api/topics/:id
export const getTopic = catchAsync(async (req, res) => {
  const topic = await Topic.findById(req.params.id);
  if (!topic) throw new AppError('Topic not found', 404);

  // Increment popularity
  topic.stats.popularity += 1;
  await topic.save({ validateBeforeSave: false });

  res.json({ topic });
});

// POST /api/topics
export const createTopic = catchAsync(async (req, res) => {
  const { name, subject, difficulty, description, keyPoints, estimatedTime } = req.body;

  const topic = await Topic.create({
    name, subject, difficulty, description,
    keyPoints, estimatedTime,
    createdBy: req.user._id
  });

  res.status(201).json({ topic });
});

// PATCH /api/topics/:id
export const updateTopic = catchAsync(async (req, res) => {
  const topic = await Topic.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!topic) throw new AppError('Topic not found or not yours', 404);

  Object.assign(topic, req.body);
  await topic.save();

  res.json({ topic });
});

// DELETE /api/topics/:id
export const deleteTopic = catchAsync(async (req, res) => {
  const topic = await Topic.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
  if (!topic) throw new AppError('Topic not found or not yours', 404);
  res.json({ message: 'Topic deleted' });
});

// POST /api/topics/:id/prep-notes
export const getPrepNotes = catchAsync(async (req, res) => {
  const topic = await Topic.findById(req.params.id);
  if (!topic) throw new AppError('Topic not found', 404);

  const notes = await generatePrepNotes({
    topicName:  topic.name,
    subject:    topic.subject,
    keyPoints:  topic.keyPoints,
    difficulty: topic.difficulty
  });

  res.json({ notes });
});
