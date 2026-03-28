// server/models/StudyEvent.js
import mongoose from 'mongoose';

const studyEventSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['study-session', 'exam', 'review', 'assignment', 'deadline', 'custom'],
    default: 'study-session'
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true
  },
  allDay: {
    type: Boolean,
    default: false
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  
  // Recurrence
  recurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
    },
    interval: Number, // Every X days/weeks/months
    daysOfWeek: [Number], // 0-6 (Sunday-Saturday)
    endDate: Date
  },
  
  // Reminders
  reminders: [{
    minutes: Number, // Minutes before event
    sent: {
      type: Boolean,
      default: false
    }
  }],
  
  // Actual time spent (for completed events)
  actualDuration: Number, // in minutes
  
  // Related entities
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam'
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  
  // Color coding
  color: {
    type: String,
    default: '#10b981' // green
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  notes: String
}, {
  timestamps: true
});

// Index for calendar queries
studyEventSchema.index({ user: 1, startDate: 1, endDate: 1 });
studyEventSchema.index({ user: 1, completed: 1 });

// Virtual for duration in minutes
studyEventSchema.virtual('duration').get(function() {
  if (this.endDate && this.startDate) {
    return Math.round((this.endDate - this.startDate) / (1000 * 60));
  }
  return 0;
});

const StudyEvent = mongoose.model('StudyEvent', studyEventSchema);

export default StudyEvent;