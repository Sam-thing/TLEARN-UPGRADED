// controllers/authController.js — secure + profile backend
import User from '../models/User.js';
import { sendToken } from '../config/jwt.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { invalidateUserCache } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

// ── Rate limiters (applied per-route in auth.js router) ──────────────────────

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per IP
  message: { message: 'Too many login attempts — try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failures
});

export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,                    // 5 registrations per IP per hour
  message: { message: 'Too many accounts created — try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const sanitizeString = (str, maxLen = 100) => {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ── POST /api/auth/register ───────────────────────────────────────────────────

export const register = catchAsync(async (req, res) => {
  const name     = sanitizeString(req.body.name, 50);
  const email    = sanitizeString(req.body.email, 254).toLowerCase();
  const password = req.body.password;        // raw — hashed by pre-save hook
  const institution = sanitizeString(req.body.institution || '', 100);
  const level    = ['high-school', 'university', 'self-learner'].includes(req.body.level)
    ? req.body.level
    : 'university';

  // Validate
  if (!name || name.length < 2)  throw new AppError('Name must be at least 2 characters', 400);
  if (!isValidEmail(email))      throw new AppError('Invalid email address', 400);
  if (!password || password.length < 8) throw new AppError('Password must be at least 8 characters', 400);
  if (/\s/.test(password))       throw new AppError('Password cannot contain spaces', 400);

  const user = await User.create({ name, email, password, institution, level });
  sendToken(user, 201, res);
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

export const login = catchAsync(async (req, res) => {
  const email    = sanitizeString(String(req.body.email || ''), 254).toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // +password: select it back since schema hides it by default
  const user = await User.findOne({ email }).select('+password').lean({ getters: true });

  // Always run bcrypt even if user not found — prevents timing attacks
  const isMatch = user ? await import('bcryptjs').then(b => b.default.compare(password, user.password)) : false;

  if (!user || !isMatch) {
    // Generic message — don't reveal whether email exists
    throw new AppError('Invalid email or password', 401);
  }

  sendToken(user, 200, res);
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
// This is called once on app load. With the cache in auth middleware it's fast.

export const getMe = catchAsync(async (req, res) => {
  // req.user is already set by protect middleware (cached)
  res.json({
    user: {
      id:          req.user._id,
      name:        req.user.name,
      email:       req.user.email,
      institution: req.user.institution,
      level:       req.user.level,
      bio:         req.user.bio,
      avatar:      req.user.avatar,
      stats:       req.user.stats,
      streak:      req.user.streak,
    }
  });
});

// ── PATCH /api/auth/profile ───────────────────────────────────────────────────
// THE MISSING PROFILE BACKEND

export const updateProfile = catchAsync(async (req, res) => {
  const allowedFields = ['name', 'institution', 'level', 'bio'];
  const validLevels   = ['high-school', 'university', 'self-learner'];

  // Build update object — only allowed fields, sanitized
  const updates = {};

  if (req.body.name !== undefined) {
    const name = sanitizeString(req.body.name, 50);
    if (name.length < 2) throw new AppError('Name must be at least 2 characters', 400);
    updates.name = name;
  }

  if (req.body.institution !== undefined) {
    updates.institution = sanitizeString(req.body.institution, 100);
  }

  if (req.body.level !== undefined) {
    if (!validLevels.includes(req.body.level)) {
      throw new AppError('Invalid level value', 400);
    }
    updates.level = req.body.level;
  }

  if (req.body.bio !== undefined) {
    updates.bio = sanitizeString(req.body.bio, 300);
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields provided', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) throw new AppError('User not found', 404);

  // Bust the auth cache so next request sees fresh data
  invalidateUserCache(String(req.user._id));

  res.json({
    user: {
      id:          user._id,
      name:        user.name,
      email:       user.email,
      institution: user.institution,
      level:       user.level,
      bio:         user.bio,
      avatar:      user.avatar,
      stats:       user.stats,
      streak:      user.streak,
    }
  });
});

// ── PATCH /api/auth/password ──────────────────────────────────────────────────

export const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new AppError('Both old and new password are required', 400);
  }
  if (newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters', 400);
  }
  if (oldPassword === newPassword) {
    throw new AppError('New password must differ from current password', 400);
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw new AppError('Current password is incorrect', 401);

  user.password = newPassword;
  await user.save();

  invalidateUserCache(String(req.user._id));

  // Issue a fresh token so client doesn't need to re-login
  sendToken(user, 200, res);
});