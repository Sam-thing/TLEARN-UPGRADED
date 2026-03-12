// server/models/Topic.js
import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['Networking', 'ICT', 'Mathematics', 'Science', 'Programming', 'Business', 'Languages', 'Other']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  description: {
    type: String,
    trim: true
  },
  content: {
    keyPoints: [String],
    resources: [String]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // POPULARITY METRICS - NEW!
  viewCount: {
    type: Number,
    default: 0
  },
  studySessionsStarted: {
    type: Number,
    default: 0
  },
  completionsCount: {
    type: Number,
    default: 0
  },
  popularity: {
    type: Number,
    default: 0,
    index: true  // Index for faster sorting
  },
  
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// METHOD: Calculate and update popularity score
topicSchema.methods.updatePopularity = function() {
  this.popularity = 
    (this.viewCount || 0) * 1 + 
    (this.studySessionsStarted || 0) * 5 + 
    (this.completionsCount || 0) * 10;
  return this.save();
};

// METHOD: Increment view count
topicSchema.methods.incrementViews = async function() {
  this.viewCount = (this.viewCount || 0) + 1;
  await this.updatePopularity();
  return this;
};

// METHOD: Increment study sessions
topicSchema.methods.incrementSessions = async function() {
  this.studySessionsStarted = (this.studySessionsStarted || 0) + 1;
  await this.updatePopularity();
  return this;
};

// METHOD: Increment completions
topicSchema.methods.incrementCompletions = async function() {
  this.completionsCount = (this.completionsCount || 0) + 1;
  await this.updatePopularity();
  return this;
};

// STATIC: Get popular topics (minimum threshold)
topicSchema.statics.getPopular = function(limit = 6) {
  return this.find({
    isPublic: true,
    $or: [
      { viewCount: { $gte: 5 } },
      { studySessionsStarted: { $gte: 2 } }
    ]
  })
  .sort({ popularity: -1 })
  .limit(limit)
  .lean();
};

const Topic = mongoose.model('Topic', topicSchema);

export default Topic;