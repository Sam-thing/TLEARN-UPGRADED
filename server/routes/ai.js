// server/routes/ai.js
import { Router } from 'express';
import aiService from '../services/aiService.js';
import { protect } from '../middleware/auth.js';
import { catchAsync } from '../middleware/errorHandler.js';

const router = Router();

// All AI routes require authentication
router.use(protect);

/**
 * POST /api/ai/punctuate
 * Add punctuation to text
 */
router.post('/punctuate', catchAsync(async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Text is required' });
  }

  const correctedText = await aiService.addPunctuation(text);

  res.json({ 
    original: text,
    corrected: correctedText 
  });
}));

/**
 * POST /api/ai/feedback
 * Generate feedback for teaching session
 */
router.post('/feedback', catchAsync(async (req, res) => {
  const { topicName, transcript, subject } = req.body;

  if (!topicName || !transcript) {
    return res.status(400).json({ 
      message: 'Topic name and transcript are required' 
    });
  }

  if (transcript.length < 50) {
    return res.status(400).json({ 
      message: 'Transcript is too short for meaningful feedback' 
    });
  }

  const feedback = await aiService.generateFeedback(topicName, transcript, subject);

  res.json({ feedback });
}));

/**
 * POST /api/ai/generate-notes
 * Generate study notes for a topic
 */
router.post('/generate-notes', catchAsync(async (req, res) => {
  const { topicName, subject, additionalContext } = req.body;

  if (!topicName) {
    return res.status(400).json({ message: 'Topic name is required' });
  }

  const notes = await aiService.generateNotes(topicName, subject, additionalContext);

  res.json({ notes });
}));

/**
 * POST /api/ai/generate-questions
 * Generate practice questions for a topic
 */
router.post('/generate-questions', catchAsync(async (req, res) => {
  const { topicName, subject, difficulty = 'medium', count = 5 } = req.body;

  if (!topicName) {
    return res.status(400).json({ message: 'Topic name is required' });
  }

  const questions = await aiService.generateQuestions(
    topicName, 
    subject, 
    difficulty, 
    Math.min(count, 10) // Max 10 questions
  );

  res.json({ questions });
}));

/**
 * POST /api/ai/analyze-coverage
 * Analyze what topics were covered in transcript
 */
router.post('/analyze-coverage', catchAsync(async (req, res) => {
  const { transcript, expectedTopic } = req.body;

  if (!transcript || !expectedTopic) {
    return res.status(400).json({ 
      message: 'Transcript and expected topic are required' 
    });
  }

  const analysis = await aiService.analyzeTopicsCovered(transcript, expectedTopic);

  res.json({ analysis });
}));

export default router;