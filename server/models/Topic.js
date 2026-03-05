// models/Topic.js
import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Topic name is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  description: { type: String, default: '' },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  keyPoints:   [{ type: String }], // bullet points for prep notes
  estimatedTime: { type: Number, default: 5 }, // minutes

  // Who created it (null = system topic)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isPublic: { type: Boolean, default: true },

  // Aggregate stats across all sessions on this topic
  stats: {
    totalSessions: { type: Number, default: 0 },
    averageScore:  { type: Number, default: 0 },
    popularity:    { type: Number, default: 0 }  // views + sessions combined
  }
}, {
  timestamps: true
});

topicSchema.index({ name: 'text', subject: 'text' }); // text search
topicSchema.index({ 'stats.popularity': -1 });

export default mongoose.model('Topic', topicSchema);