// server/models/Flashcard.js
import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    index: true
  },
  front: {
    type: String,
    required: true
  },
  back: {
    type: String,
    required: true
  },
  tags: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  
  // Spaced Repetition Algorithm (SM-2)
  easeFactor: {
    type: Number,
    default: 2.5,
    min: 1.3
  },
  interval: {
    type: Number,
    default: 0 // Days until next review
  },
  repetitions: {
    type: Number,
    default: 0
  },
  nextReview: {
    type: Date,
    default: Date.now
  },
  lastReviewed: Date,
  
  // Review history
  reviews: [{
    date: Date,
    quality: Number, // 0-5 (0=complete blackout, 5=perfect)
    timeSpent: Number // seconds
  }],
  
  // Stats
  timesReviewed: {
    type: Number,
    default: 0
  },
  timesCorrect: {
    type: Number,
    default: 0
  },
  averageQuality: {
    type: Number,
    default: 0
  },
  
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  source: String // 'manual', 'ai-generated', 'imported'
}, {
  timestamps: true
});

// Method to update card based on review quality (SM-2 Algorithm)
flashcardSchema.methods.reviewCard = function(quality) {
  // quality: 0-5 scale
  // 0-2: Again (forgot)
  // 3: Hard
  // 4: Good  
  // 5: Easy
  
  this.lastReviewed = new Date();
  this.timesReviewed += 1;
  
  // Record review
  this.reviews.push({
    date: new Date(),
    quality,
    timeSpent: 0
  });
  
  // Update statistics
  if (quality >= 4) {
    this.timesCorrect += 1;
  }
  
  const totalQuality = this.reviews.reduce((sum, r) => sum + r.quality, 0);
  this.averageQuality = totalQuality / this.reviews.length;
  
  // SM-2 Algorithm
  if (quality >= 3) {
    // Correct answer
    if (this.repetitions === 0) {
      this.interval = 1;
    } else if (this.repetitions === 1) {
      this.interval = 6;
    } else {
      this.interval = Math.round(this.interval * this.easeFactor);
    }
    this.repetitions += 1;
  } else {
    // Incorrect answer - reset
    this.repetitions = 0;
    this.interval = 1;
  }
  
  // Update ease factor
  this.easeFactor = Math.max(
    1.3,
    this.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );
  
  // Set next review date
  this.nextReview = new Date(Date.now() + this.interval * 24 * 60 * 60 * 1000);
  
  return this.save();
};

// Index for spaced repetition queries
flashcardSchema.index({ user: 1, nextReview: 1 });
flashcardSchema.index({ user: 1, topic: 1 });

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

export default Flashcard;