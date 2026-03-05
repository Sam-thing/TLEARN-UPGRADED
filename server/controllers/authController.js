// controllers/authController.js
import User from '../models/User.js';
import { sendToken } from '../config/jwt.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

// POST /api/auth/register
export const register = catchAsync(async (req, res) => {
  const { name, email, password, institution, level } = req.body;

  const user = await User.create({ name, email, password, institution, level });
  sendToken(user, 201, res);
});

// POST /api/auth/login
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  sendToken(user, 200, res);
});

// GET /api/auth/me
// controllers/authController.js
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/auth/profile
export const updateProfile = catchAsync(async (req, res) => {
  const { name, institution, level, bio } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, institution, level, bio },
    { new: true, runValidators: true }
  );

  res.json({ user });
});

// PATCH /api/auth/password
export const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(oldPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  sendToken(user, 200, res);
});