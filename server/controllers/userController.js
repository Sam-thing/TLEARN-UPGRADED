import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// PUT /api/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find user
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update allowed fields
  const fields = ['name', 'email', 'password', 'institution', 'level', 'bio', 'avatar', 'streak', 'stats'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  await user.save(); // password pre-save hook will hash it if changed
  res.json(user);
});