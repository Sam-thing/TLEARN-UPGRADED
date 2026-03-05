// models/Session.js
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },

  transcript: { type: String, required: true },
  duration:   { type: Number, required: true }, // seconds
  audioUrl:   { type: String, default: '' },    // if storing audio file

  // AI Feedback (filled after Claude analysis)
  feedback: {
    score:           { type: Number, min: 0, max: 100, default: 0 },
    accuracyScore:   { type: Number, min: 0, max: 100, default: 0 },
    clarityScore:    { type: Number, min: 0, max: 100, default: 0 },
    confidenceScore: { type: Number, min: 0, max: 100, default: 0 },
    overall:         { type: String, default: '' },   // paragraph summary
    strengths:       [{ type: String }],
    improvements:    [{ type: String }],
    missingPoints:   [{ type: String }],
    quizQuestions:   [{
      question: String,
      answer:   String
    }]
  },

  // Word-level analysis
  analysis: {
    wordCount:   { type: Number, default: 0 },
    fillerWords: { type: Number, default: 0 },
    wordsPerMin: { type: Number, default: 0 }
  },

  status: {
    type: String,
    enum: ['pending', 'analyzed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

sessionSchema.index({ user: 1, createdAt: -1 });
sessionSchema.index({ topic: 1 });

export default mongoose.model('Session', sessionSchema);