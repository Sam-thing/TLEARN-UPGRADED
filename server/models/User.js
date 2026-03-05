// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // never returned in queries by default
  },
  institution: { type: String, trim: true, default: '' },
  level: {
    type: String,
    enum: ['high-school', 'university', 'self-learner'],
    default: 'university'
  },
  bio:    { type: String, maxlength: 300, default: '' },
  avatar: { type: String, default: '' },

  // Streak tracking
  streak: {
    current:    { type: Number, default: 0 },
    longest:    { type: Number, default: 0 },
    lastActive: { type: Date, default: null }
  },

  // Cached stats (updated after each session)
  stats: {
    totalSessions:  { type: Number, default: 0 },
    averageScore:   { type: Number, default: 0 },
    topicsExplored: { type: Number, default: 0 },
    totalDuration:  { type: Number, default: 0 } // seconds
  }
}, {
  timestamps: true
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Update streak logic
userSchema.methods.updateStreak = function () {
  const today     = new Date();
  const last      = this.streak.lastActive;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const sameDay  = last && last.toDateString() === today.toDateString();
  const wasYday  = last && last.toDateString() === yesterday.toDateString();

  if (sameDay) return; // already active today
  if (wasYday) {
    this.streak.current += 1;
  } else {
    this.streak.current = 1; // reset
  }
  if (this.streak.current > this.streak.longest) {
    this.streak.longest = this.streak.current;
  }
  this.streak.lastActive = today;
};

export default mongoose.model('User', userSchema);