// server/controllers/examsController.js
import Exam from '../models/Exam.js';
import Topic from '../models/Topic.js';
import aiService from '../services/aiService.js';
import { catchAsync } from '../middleware/errorHandler.js';
import gamificationService from '../services/gamificationService.js';

/**
 * POST /api/exams
 * Create a new exam
 */
export const createExam = catchAsync(async (req, res) => {
  const { title, description, topics, difficulty, timeLimit, questionCount } = req.body;

  if (!title || !topics || topics.length === 0) {
    return res.status(400).json({ 
      message: 'Title and at least one topic are required' 
    });
  }

  const exam = await Exam.create({
    user: req.user._id,
    title,
    description,
    topics,
    difficulty: difficulty || 'medium',
    timeLimit: timeLimit || 30,
    status: 'draft'
  });

  await exam.populate('topics', 'name subject');

  res.status(201).json({ exam });
});

/**
 * POST /api/exams/generate
 * Generate exam with AI questions
 */
export const generateExam = catchAsync(async (req, res) => {
  const { title, topicIds, difficulty = 'medium', questionCount = 10, timeLimit = 30 } = req.body;

  if (!topicIds || topicIds.length === 0) {
    return res.status(400).json({ message: 'At least one topic is required' });
  }

  // Get topics
  const topics = await Topic.find({ _id: { $in: topicIds } });
  
  if (topics.length === 0) {
    return res.status(404).json({ message: 'Topics not found' });
  }

  // Generate questions for each topic
  const allQuestions = [];
  const questionsPerTopic = Math.ceil(questionCount / topics.length);

  for (const topic of topics) {
    try {
      const aiQuestions = await aiService.generateQuestions(
        topic.name,
        topic.subject,
        difficulty,
        questionsPerTopic
      );

      // Convert AI questions to exam format
      const examQuestions = aiQuestions.map(q => ({
        question: q.question,
        type: q.type === 'multiple-choice' ? 'multiple-choice' : 'short-answer',
        options: q.options || [],
        correctAnswer: q.correctAnswer || '',
        explanation: q.explanation || q.hint || '',
        points: 1,
        topic: topic._id
      }));

      allQuestions.push(...examQuestions);
    } catch (error) {
      console.error(`Failed to generate questions for ${topic.name}:`, error);
    }
  }

  // Shuffle questions
  const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, questionCount);

  // Create exam
  const exam = await Exam.create({
    user: req.user._id,
    title: title || `${topics.map(t => t.name).join(', ')} Exam`,
    description: `AI-generated exam covering ${topics.length} topic(s)`,
    topics: topicIds,
    questions: shuffledQuestions,
    difficulty,
    timeLimit,
    status: 'active',
    isAIGenerated: true
  });

  await exam.populate('topics', 'name subject');

  res.status(201).json({ exam });
});

/**
 * GET /api/exams
 * Get all exams for current user
 */
export const getExams = catchAsync(async (req, res) => {
  const { status, limit = 20 } = req.query;

  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const exams = await Exam.find(filter)
    .populate('topics', 'name subject')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.json({ exams });
});

/**
 * GET /api/exams/:id
 * Get single exam by ID
 */
export const getExamById = catchAsync(async (req, res) => {
  const exam = await Exam.findOne({
    _id: req.params.id,
    user: req.user._id
  }).populate('topics', 'name subject description');

  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  res.json({ exam });
});

/**
 * POST /api/exams/:id/start
 * Start taking an exam
 */
export const startExam = catchAsync(async (req, res) => {
  const exam = await Exam.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  if (exam.status === 'completed' || exam.status === 'graded') {
    return res.status(400).json({ message: 'Exam already completed' });
  }

  exam.status = 'active';
  exam.startedAt = new Date();
  
  // Remove correct answers from response
  const examData = exam.toObject();
  examData.questions = examData.questions.map(q => ({
    ...q,
    correctAnswer: undefined,
    explanation: undefined
  }));
  
  await exam.save();

  res.json({ exam: examData });
});

/**
 * POST /api/exams/:id/submit
 * Submit exam answers and grade
 */
export const submitExam = catchAsync(async (req, res) => {
  const { answers } = req.body; // Array of { questionId, answer }

  const exam = await Exam.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  if (exam.status === 'completed' || exam.status === 'graded') {
    return res.status(400).json({ message: 'Exam already submitted' });
  }

  // After exam submission
  await gamificationService.trackActivity(req.user._id, 'exam_completed', {
    passed: exam.passed,
    score: exam.score
  });

  // Grade the exam
  exam.questions.forEach(question => {
    const userAnswer = answers.find(a => a.questionId === question._id.toString());
    
    if (userAnswer) {
      question.userAnswer = userAnswer.answer;
      
      // Check if answer is correct (case-insensitive)
      const correctAnswer = question.correctAnswer.toLowerCase().trim();
      const submittedAnswer = userAnswer.answer.toLowerCase().trim();
      
      question.isCorrect = correctAnswer === submittedAnswer;
    } else {
      question.isCorrect = false;
    }
  });

  exam.completedAt = new Date();
  exam.timeSpent = Math.round((exam.completedAt - exam.startedAt) / 1000);
  exam.status = 'graded';
  
  await exam.save();
  await exam.populate('topics', 'name subject');

  //Track gamification activity
  try {
    await gamificationService.trackActivity(req.user._id, 'exam_completed', {
      passed: exam.passed,
      score: exam.score
    });
    console.log('✅ Gamification activity tracked');
  } catch (error) {
    console.error('❌ Gamification tracking failed:', error.message);
  }

  res.json({ 
    exam,
    message: `Exam completed! Score: ${exam.score}%`
  });
});

/**
 * DELETE /api/exams/:id
 * Delete an exam
 */
export const deleteExam = catchAsync(async (req, res) => {
  const exam = await Exam.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  res.json({ message: 'Exam deleted successfully' });
});

/**
 * GET /api/exams/stats
 * Get exam statistics
 */
export const getExamStats = catchAsync(async (req, res) => {
  const exams = await Exam.find({ 
    user: req.user._id,
    status: 'graded'
  });

  const stats = {
    totalExams: exams.length,
    averageScore: exams.length > 0 
      ? Math.round(exams.reduce((sum, e) => sum + e.score, 0) / exams.length)
      : 0,
    passedExams: exams.filter(e => e.passed).length,
    failedExams: exams.filter(e => !e.passed).length,
    totalQuestions: exams.reduce((sum, e) => sum + (e.totalQuestions || 0), 0),
    totalCorrect: exams.reduce((sum, e) => sum + (e.correctAnswers || 0), 0),
    bestScore: exams.length > 0 ? Math.max(...exams.map(e => e.score)) : 0,
    worstScore: exams.length > 0 ? Math.min(...exams.map(e => e.score)) : 0
  };

  res.json({ stats });
});