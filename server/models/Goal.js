// server/models/Goal.js
import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['session_count', 'total_minutes', 'average_score', 'streak', 'custom'],
    default: 'custom'
  },
  target: {
    type: Number,
    required: true,
    min: 1
  },
  current: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual to calculate progress percentage
goalSchema.virtual('progress').get(function () {
  if (!this.target) return 0;
  return Math.min(Math.round((this.current / this.target) * 100), 100);
});

// Method to check and mark as completed
goalSchema.methods.checkCompletion = function () {
  if (this.current >= this.target && !this.completed) {
    this.completed = true;
    this.completedAt = new Date();
    return true;
  }
  return false;
};

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;