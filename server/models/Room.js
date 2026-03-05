// models/Room.js
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  description: { type: String, default: '' },
  type: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  maxMembers: { type: Number, default: 10, max: 50 },

  members: [{
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    role:     { type: String, enum: ['owner', 'member'], default: 'member' }
  }],

  messages: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content:   { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],

  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

roomSchema.index({ topic: 1 });
roomSchema.index({ type: 1, isActive: 1 });

export default mongoose.model('Room', roomSchema);