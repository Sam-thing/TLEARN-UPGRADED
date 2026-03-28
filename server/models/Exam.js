// server/models/Exam.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer'],
    default: 'multiple-choice'
  },
  options: [String], // For multiple choice
  correctAnswer: String,
  userAnswer: String,
  isCorrect: Boolean,
  points: {
    type: Number,
    default: 1
  },
  explanation: String,
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }
});

const examSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  topics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  questions: [questionSchema],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'medium'
  },
  timeLimit: {
    type: Number, // in minutes
    default: 30
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'graded'],
    default: 'draft'
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  correctAnswers: Number,
  totalQuestions: Number,
  startedAt: Date,
  completedAt: Date,
  timeSpent: Number, // in seconds
  passingScore: {
    type: Number,
    default: 60
  },
  passed: Boolean,
  isAIGenerated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Calculate score before saving
examSchema.pre('save', function(next) {
  if (this.status === 'graded' || this.status === 'completed') {
    const gradedQuestions = this.questions.filter(q => q.isCorrect !== undefined);
    const correct = gradedQuestions.filter(q => q.isCorrect).length;
    const total = gradedQuestions.length;
    
    this.correctAnswers = correct;
    this.totalQuestions = total;
    this.score = total > 0 ? Math.round((correct / total) * 100) : 0;
    this.passed = this.score >= this.passingScore;
  }
  next();
});

// Index for faster queries
examSchema.index({ user: 1, status: 1 });
examSchema.index({ user: 1, createdAt: -1 });

const Exam = mongoose.model('Exam', examSchema);

export default Exam;