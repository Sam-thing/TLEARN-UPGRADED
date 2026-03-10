// controllers/sessionsController.js
import Session from '../models/Session.js';
import Topic   from '../models/Topic.js';
import User    from '../models/User.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { analyseSession } from '../services/claudeService.js';

// POST /api/sessions
export const createSession = catchAsync(async (req, res) => {
  const { topicId, transcript, duration } = req.body;

  if (!transcript || transcript.trim().length < 20) {
    throw new AppError('Transcript is too short to analyse', 400);
  }

  const topic = await Topic.findById(topicId);
  if (!topic) throw new AppError('Topic not found', 404);

  // Handle audio file
  let audioUrl = '';
  if (req.file) {
    audioUrl = `/uploaded/${req.file.filename}`;
  }

  // Create session first (status: pending)
  const session = await Session.create({
    user:  req.user._id,
    topic: topicId,
    transcript,
    duration: Number(duration) || 0,
    audioUrl,
    analysis: {
      wordCount:   transcript.split(/\s+/).length,
      fillerWords: countFillerWords(transcript),
      wordsPerMin: duration ? Math.round(transcript.split(/\s+/).length / (duration / 60)) : 0
    }
  });

  // Analyse with Claude
  try {
    const feedback = await analyseSession({
      transcript,
      topicName:  topic.name,
      keyPoints:  topic.keyPoints
    });

    session.feedback = feedback;
    session.status   = 'analyzed';
    await session.save();

    // Update user stats & streak
    await updateUserStats(req.user._id, feedback.score);

    // Update topic stats
    await updateTopicStats(topicId, feedback.score);

  } catch (err) {
    console.error('Claude analysis failed:', err.message);
    session.status = 'failed';
    await session.save();
  }

  // Populate topic before returning
  await session.populate('topic', 'name subject difficulty');

  res.status(201).json({ session });
});

// GET /api/sessions
export const getSessions = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, topic, minScore, maxScore } = req.query;

  const filter = { user: req.user._id };
  if (topic)    filter.topic = topic;
  if (minScore || maxScore) {
    filter['feedback.score'] = {};
    if (minScore) filter['feedback.score'].$gte = Number(minScore);
    if (maxScore) filter['feedback.score'].$lte = Number(maxScore);
  }

  const sessions = await Session.find(filter)
    .populate('topic', 'name subject difficulty')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Session.countDocuments(filter);

  res.json({ sessions, total, page: Number(page) });
});

// GET /api/sessions/recent
export const getRecentSessions = catchAsync(async (req, res) => {
  const { limit = 5 } = req.query;

  const sessions = await Session.find({ user: req.user._id })
    .populate('topic', 'name subject')
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.json({ sessions });
});

// GET /api/sessions/stats
export const getSessionStats = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    totalSessions:  user.stats.totalSessions,
    averageScore:   user.stats.averageScore,
    topicsExplored: user.stats.topicsExplored,
    totalDuration:  user.stats.totalDuration,
    streak:         user.streak
  });
});

// GET /api/sessions/:id
export const getSession = catchAsync(async (req, res) => {
  const session = await Session.findOne({ _id: req.params.id, user: req.user._id })
    .populate('topic', 'name subject difficulty keyPoints');
  if (!session) throw new AppError('Session not found', 404);
  res.json({ session });
});

// DELETE /api/sessions/:id
export const deleteSession = catchAsync(async (req, res) => {
  const session = await Session.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!session) throw new AppError('Session not found', 404);
  res.json({ message: 'Session deleted' });
});

// ── Helpers ────────────────────────────────────────────────────────────────

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually', 'sort of', 'kind of'];

const countFillerWords = (text) => {
  const lower = text.toLowerCase();
  return FILLER_WORDS.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    return count + (lower.match(regex)?.length || 0);
  }, 0);
};

const updateUserStats = async (userId, newScore) => {
  const user = await User.findById(userId);

  const prev      = user.stats.totalSessions;
  const prevAvg   = user.stats.averageScore;
  const newTotal  = prev + 1;
  const newAvg    = Math.round((prevAvg * prev + newScore) / newTotal);

  user.stats.totalSessions = newTotal;
  user.stats.averageScore  = newAvg;
  user.updateStreak();

  await user.save({ validateBeforeSave: false });
};

const updateTopicStats = async (topicId, newScore) => {
  const topic = await Topic.findById(topicId);
  const prev  = topic.stats.totalSessions;
  const avg   = topic.stats.averageScore;

  topic.stats.totalSessions  = prev + 1;
  topic.stats.averageScore   = Math.round((avg * prev + newScore) / (prev + 1));
  topic.stats.popularity    += 2;

  await topic.save({ validateBeforeSave: false });
};