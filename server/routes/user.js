// server/routes/user.js
import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { catchAsync } from '../middleware/errorHandler.js';

const router = express.Router();

// GET /api/users/me 
router.get('/me', protect, catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').lean();
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
}));

// PATCH /api/users/me 
router.patch('/me', protect, catchAsync(async (req, res) => {
  const allowed = ['name', 'institution', 'level', 'bio', 'avatar'];
  const updates = {};

  for (const field of allowed) {
    if (req.body[field] !== undefined) {
      updates[field] = typeof req.body[field] === 'string'
        ? req.body[field].trim().slice(0, 300)
        : req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No valid fields provided' });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ user });
}));

// PUT /api/users/:id — kept for backward compatibility
router.put('/:id', protect, catchAsync(async (req, res) => {
  // Users can only update themselves
  if (req.params.id !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized to update this user' });
  }

  const allowed = ['name', 'institution', 'level', 'bio', 'avatar'];
  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
}));

export default router;