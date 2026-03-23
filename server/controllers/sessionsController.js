// server/controllers/sessionsController.js
import Session from '../models/Session.js';
import Topic from '../models/Topic.js';
import User from '../models/User.js';
import aiService from '../services/aiService.js';
import notificationService from '../services/notificationService.js';
import { checkMilestones } from './progressController.js';
import { catchAsync } from '../middleware/errorHandler.js';

/**
 * POST /api/sessions
 * Create a new teaching session with AI feedback
 */
export const createSession = catchAsync(async (req, res) => {
  const { topicId, transcript, duration, audioUrl } = req.body;

  if (!topicId || !transcript) {
    return res.status(400).json({ 
      message: 'Topic ID and transcript are required' 
    });
  }

  // Get topic details
  const topic = await Topic.findById(topicId);
  if (!topic) {
    return res.status(404).json({ message: 'Topic not found' });
  }

  // ✅ STEP 1: Add punctuation to transcript
  const correctedTranscript = await aiService.addPunctuation(transcript);

  // ✅ STEP 2: Generate AI feedback
  const feedback = await aiService.generateFeedback(
    topic.name,
    correctedTranscript,
    topic.subject
  );

  // ✅ STEP 3: Analyze topic coverage
  const coverage = await aiService.analyzeTopicsCovered(
    correctedTranscript,
    topic.name
  );

  // Create session with AI feedback
  const session = await Session.create({
    user: req.user._id,
    topic: topicId,
    transcript: correctedTranscript, // Save corrected version
    originalTranscript: transcript, // Keep original too
    duration: duration || 0,
    audioUrl,
    feedback: {
      score: feedback.score,
      strengths: feedback.strengths,
      improvements: feedback.improvements,
      summary: feedback.summary,
      aiModel: feedback.model
    },
    analysis: {
      topicsCovered: coverage.topicsCovered,
      missingTopics: coverage.missingTopics,
      coveragePercentage: coverage.coveragePercentage
    },
    status: 'analyzed'
  });

  // ✅ STEP 4: Update user stats
  const user = await User.findById(req.user._id);
  user.stats.totalSessions += 1;
  user.stats.totalMinutes += duration || 0;
  
  // Update average score
  const allSessions = await Session.find({ user: req.user._id, status: 'analyzed' });
  const totalScore = allSessions.reduce((sum, s) => sum + s.feedback.score, 0);
  user.stats.averageScore = Math.round(totalScore / allSessions.length);
  
  // Update streak
  const today = new Date().toISOString().split('T')[0];
  const lastSessionDate = user.stats.lastSessionDate?.toISOString().split('T')[0];
  
  if (lastSessionDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (lastSessionDate === yesterday) {
      user.streak.current += 1;
    } else {
      user.streak.current = 1;
    }
    user.streak.longest = Math.max(user.streak.longest, user.streak.current);
  }
  
  user.stats.lastSessionDate = new Date();
  await user.save();

  // ✅ STEP 5: Send notification
  await notificationService.sessionCompleted(
    req.user._id,
    session._id,
    feedback.score,
    topic.name
  );

  // ✅ STEP 6: Check for milestone achievements
  await checkMilestones(req.user._id);

  // Populate topic details for response
  await session.populate('topic', 'name subject');

  res.status(201).json({ 
    session,
    message: 'Session analyzed successfully'
  });
});

/**
 * GET /api/sessions
 * Get all sessions for current user
 */
export const getSessions = catchAsync(async (req, res) => {
  const { limit = 20, status } = req.query;

  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const sessions = await Session.find(filter)
    .populate('topic', 'name subject')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.json({ sessions });
});

/**
 * GET /api/sessions/:id
 * Get single session by ID
 */
export const getSessionById = catchAsync(async (req, res) => {
  const session = await Session.findOne({
    _id: req.params.id,
    user: req.user._id
  }).populate('topic', 'name subject description');

  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  res.json({ session });
});

/**
 * DELETE /api/sessions/:id
 * Delete a session
 */
export const deleteSession = catchAsync(async (req, res) => {
  const session = await Session.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  // Update user stats
  const user = await User.findById(req.user._id);
  user.stats.totalSessions = Math.max(0, user.stats.totalSessions - 1);
  user.stats.totalMinutes = Math.max(0, user.stats.totalMinutes - (session.duration || 0));
  
  // Recalculate average score
  const remainingSessions = await Session.find({ 
    user: req.user._id, 
    status: 'analyzed' 
  });
  
  if (remainingSessions.length > 0) {
    const totalScore = remainingSessions.reduce((sum, s) => sum + s.feedback.score, 0);
    user.stats.averageScore = Math.round(totalScore / remainingSessions.length);
  } else {
    user.stats.averageScore = 0;
  }
  
  await user.save();

  res.json({ message: 'Session deleted successfully' });
});

/**
 * POST /api/sessions/:id/regenerate-feedback
 * Regenerate AI feedback for existing session
 */
export const regenerateFeedback = catchAsync(async (req, res) => {
  const session = await Session.findOne({
    _id: req.params.id,
    user: req.user._id
  }).populate('topic');

  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  // Generate new feedback
  const feedback = await aiService.generateFeedback(
    session.topic.name,
    session.transcript,
    session.topic.subject
  );

  // Update session
  session.feedback = {
    score: feedback.score,
    strengths: feedback.strengths,
    improvements: feedback.improvements,
    summary: feedback.summary,
    aiModel: feedback.model
  };

  await session.save();

  res.json({ 
    session,
    message: 'Feedback regenerated successfully'
  });
});