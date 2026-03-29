// server/controllers/flashcardsController.js
import Flashcard from '../models/Flashcard.js';
import Topic from '../models/Topic.js';
import Note from '../models/Note.js';
import aiService from '../services/aiService.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { gamificationService } from '../services/gamificationService.js';
import { catchAsync } from '../middleware/errorHandler.js';

/**
 * POST /api/flashcards
 * Create a new flashcard
 */
export const createFlashcard = catchAsync(async (req, res) => {
  const { front, back, topic, tags, difficulty } = req.body;

  if (!front || !back) {
    return res.status(400).json({ 
      message: 'Front and back are required' 
    });
  }

  const flashcard = await Flashcard.create({
    user: req.user._id,
    front,
    back,
    topic,
    tags: tags || [],
    difficulty: difficulty || 'medium',
    source: 'manual'
  });

  await flashcard.populate('topic', 'name subject');

  res.status(201).json({ flashcard });
});

/**
 * POST /api/flashcards/generate
 * Generate flashcards from topic or note using AI
 */
export const generateFlashcards = catchAsync(async (req, res) => {
  const { topicId, noteId, count = 10 } = req.body;

  let content = '';
  let topicRef = null;
  let tags = [];

  if (topicId) {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    content = `${topic.name}: ${topic.description}`;
    topicRef = topicId;
    tags = [topic.subject];
  } else if (noteId) {
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    content = note.content;
    topicRef = note.topic;
    tags = note.tags || [];
  } else {
    return res.status(400).json({ 
      message: 'Either topicId or noteId is required' 
    });
  }

  // Use AI to generate flashcards
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompt = `Create ${count} flashcards from this content. Each flashcard should have a clear question/prompt on the front and a concise answer on the back.

Content:
${content}

Return ONLY a JSON array in this exact format:
[
  {
    "front": "Question or prompt here?",
    "back": "Clear, concise answer here",
    "difficulty": "easy" or "medium" or "hard"
  }
]

Make the flashcards effective for memorization and testing knowledge.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                     responseText.match(/```\n([\s\S]*?)\n```/) ||
                     responseText.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
    
    const flashcardsData = JSON.parse(jsonText);

    // Create flashcards in database
    const flashcards = await Flashcard.insertMany(
      flashcardsData.map(fc => ({
        user: req.user._id,
        front: fc.front,
        back: fc.back,
        topic: topicRef,
        tags,
        difficulty: fc.difficulty || 'medium',
        isAIGenerated: true,
        source: 'ai-generated'
      }))
    );

    res.status(201).json({ 
      flashcards,
      count: flashcards.length 
    });
  } catch (error) {
    console.error('Failed to generate flashcards:', error);
    res.status(500).json({ message: 'Failed to generate flashcards' });
  }
});

/**
 * GET /api/flashcards
 * Get all flashcards for current user
 */
export const getFlashcards = catchAsync(async (req, res) => {
  const { topic, tags, limit = 50 } = req.query;

  const filter = { user: req.user._id };
  
  if (topic) filter.topic = topic;
  if (tags) filter.tags = { $in: tags.split(',') };

  const flashcards = await Flashcard.find(filter)
    .populate('topic', 'name subject')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.json({ flashcards });
});

/**
 * GET /api/flashcards/due
 * Get flashcards due for review (spaced repetition)
 */
export const getDueFlashcards = catchAsync(async (req, res) => {
  const { limit = 20 } = req.query;

  const flashcards = await Flashcard.find({
    user: req.user._id,
    nextReview: { $lte: new Date() }
  })
    .populate('topic', 'name subject')
    .sort({ nextReview: 1 })
    .limit(parseInt(limit));

  res.json({ 
    flashcards,
    count: flashcards.length
  });
});

/**
 * GET /api/flashcards/:id
 * Get single flashcard
 */
export const getFlashcardById = catchAsync(async (req, res) => {
  const flashcard = await Flashcard.findOne({
    _id: req.params.id,
    user: req.user._id
  }).populate('topic', 'name subject');

  if (!flashcard) {
    return res.status(404).json({ message: 'Flashcard not found' });
  }

  res.json({ flashcard });
});

/**
 * POST /api/flashcards/:id/review
 * Review a flashcard (spaced repetition)
 */
export const reviewFlashcard = catchAsync(async (req, res) => {
  const { quality } = req.body; // 0-5 scale

  if (quality === undefined || quality < 0 || quality > 5) {
    return res.status(400).json({ 
      message: 'Quality must be between 0 and 5' 
    });
  }

  const flashcard = await Flashcard.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!flashcard) {
    return res.status(404).json({ message: 'Flashcard not found' });
  }

  // Update using SM-2 algorithm
  await flashcard.reviewCard(quality);

  res.json({ 
    flashcard,
    message: quality >= 4 ? 'Great job!' : quality >= 3 ? 'Good!' : 'Keep practicing!'
  });
});

// After flashcard review
await gamificationService.trackActivity(req.user._id, 'flashcard_reviewed', {
  mastered: flashcard.repetitions >= 5
});

/**
 * PUT /api/flashcards/:id
 * Update a flashcard
 */
export const updateFlashcard = catchAsync(async (req, res) => {
  const { front, back, tags, difficulty } = req.body;

  const flashcard = await Flashcard.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!flashcard) {
    return res.status(404).json({ message: 'Flashcard not found' });
  }

  if (front) flashcard.front = front;
  if (back) flashcard.back = back;
  if (tags) flashcard.tags = tags;
  if (difficulty) flashcard.difficulty = difficulty;

  await flashcard.save();
  await flashcard.populate('topic', 'name subject');

  res.json({ flashcard });
});

/**
 * DELETE /api/flashcards/:id
 * Delete a flashcard
 */
export const deleteFlashcard = catchAsync(async (req, res) => {
  const flashcard = await Flashcard.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!flashcard) {
    return res.status(404).json({ message: 'Flashcard not found' });
  }

  res.json({ message: 'Flashcard deleted successfully' });
});

/**
 * GET /api/flashcards/stats
 * Get flashcard statistics
 */
export const getFlashcardStats = catchAsync(async (req, res) => {
  const flashcards = await Flashcard.find({ user: req.user._id });

  const dueToday = flashcards.filter(fc => fc.nextReview <= new Date()).length;
  const totalReviews = flashcards.reduce((sum, fc) => sum + fc.timesReviewed, 0);
  const averageQuality = flashcards.length > 0
    ? flashcards.reduce((sum, fc) => sum + fc.averageQuality, 0) / flashcards.length
    : 0;

  const stats = {
    totalCards: flashcards.length,
    dueToday,
    totalReviews,
    averageQuality: Math.round(averageQuality * 10) / 10,
    mastered: flashcards.filter(fc => fc.repetitions >= 5).length,
    learning: flashcards.filter(fc => fc.repetitions > 0 && fc.repetitions < 5).length,
    new: flashcards.filter(fc => fc.repetitions === 0).length
  };

  res.json({ stats });
});

// Import GoogleGenerativeAI at the top
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);