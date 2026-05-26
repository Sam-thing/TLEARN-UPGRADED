// server/controllers/authController.js
import User from '../models/User.js';
import { sendToken } from '../config/jwt.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

// POST /api/auth/register
export const register = catchAsync(async (req, res) => {
  const { name, email, password, institution, level } = req.body;

  if (!name?.trim() || name.trim().length < 2)
    throw new AppError('Name must be at least 2 characters', 400);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new AppError('Invalid email address', 400);
  if (!password || password.length < 8)
    throw new AppError('Password must be at least 8 characters', 400);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    institution: institution?.trim() || '',
    level: ['high-school', 'university', 'self-learner'].includes(level) ? level : 'university',
  });

  sendToken(user, 201, res);
});

// POST /api/auth/login
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new AppError('Email and password are required', 400);

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');

  const bcrypt = (await import('bcryptjs')).default;
  const dummy  = '$2a$12$dummyhashtopreventtimingattacksonnonexistentusers12345';
  const isMatch = user
    ? await bcrypt.compare(password, user.password)
    : (await bcrypt.compare(password, dummy), false);

  if (!user || !isMatch)
    throw new AppError('Invalid email or password', 401);

  sendToken(user, 200, res);
});

// GET /api/auth/me
export const getMe = catchAsync(async (req, res) => {
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
      createdAt:   req.user.createdAt,
    }
  });
});

// PATCH /api/auth/profile
export const updateProfile = catchAsync(async (req, res) => {
  const VALID_LEVELS = ['high-school', 'university', 'self-learner'];
  const updates = {};

  if (req.body.name !== undefined) {
    const name = String(req.body.name).trim();
    if (name.length < 2) throw new AppError('Name must be at least 2 characters', 400);
    updates.name = name.slice(0, 50);
  }
  if (req.body.institution !== undefined)
    updates.institution = String(req.body.institution).trim().slice(0, 100);
  if (req.body.level !== undefined) {
    if (!VALID_LEVELS.includes(req.body.level)) throw new AppError('Invalid level', 400);
    updates.level = req.body.level;
  }
  if (req.body.bio !== undefined) {
    const bio = String(req.body.bio).trim();
    if (bio.length > 300) throw new AppError('Bio cannot exceed 300 characters', 400);
    updates.bio = bio;
  }

  if (Object.keys(updates).length === 0)
    throw new AppError('No valid fields to update', 400);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) throw new AppError('User not found', 404);

  res.json({
    user: {
      id: user._id, name: user.name, email: user.email,
      institution: user.institution, level: user.level,
      bio: user.bio, avatar: user.avatar,
      stats: user.stats, streak: user.streak, createdAt: user.createdAt,
    }
  });
});

// PATCH /api/auth/password
export const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) throw new AppError('Both passwords are required', 400);
  if (newPassword.length < 8) throw new AppError('New password must be at least 8 characters', 400);
  if (oldPassword === newPassword) throw new AppError('New password must differ from current', 400);

  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw new AppError('Current password is incorrect', 401);

  user.password = newPassword;
  await user.save();
  sendToken(user, 200, res);
});