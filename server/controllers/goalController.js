// server/controllers/goalController.js
import Goal from '../models/Goal.js';
import { catchAsync } from '../middleware/errorHandler.js';

/**
 * GET /api/goals
 * Get all goals for current user
 */
export const getGoals = catchAsync(async (req, res) => {
  const goals = await Goal.find({ user: req.user._id })
    .sort({ createdAt: -1 });

  res.json({ goals });
});

/**
 * POST /api/goals
 * Create a new goal
 */
export const createGoal = catchAsync(async (req, res) => {
  const { title, description, type = 'custom', target, deadline } = req.body;

  if (!title || !target) {
    return res.status(400).json({ message: 'Title and target are required' });
  }

  const goal = await Goal.create({
    user: req.user._id,
    title,
    description,
    type,
    target: Number(target),
    deadline: deadline ? new Date(deadline) : undefined
  });

  res.status(201).json({ goal });
});

/**
 * PATCH /api/goals/:id
 * Update goal progress or details
 */
export const updateGoal = catchAsync(async (req, res) => {
  const { current, title, description, target, completed } = req.body;

  const goal = await Goal.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!goal) {
    return res.status(404).json({ message: 'Goal not found' });
  }

  if (title) goal.title = title;
  if (description) goal.description = description;
  if (target) goal.target = Number(target);
  if (current !== undefined) goal.current = Number(current);

  // Auto-check completion
  if (current !== undefined) {
    goal.checkCompletion();
  }

  if (completed === true) {
    goal.completed = true;
    goal.completedAt = new Date();
  }

  await goal.save();

  res.json({ goal });
});

/**
 * DELETE /api/goals/:id
 * Delete a goal
 */
export const deleteGoal = catchAsync(async (req, res) => {
  const goal = await Goal.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!goal) {
    return res.status(404).json({ message: 'Goal not found' });
  }

  res.json({ message: 'Goal deleted successfully' });
});

export { getGoals, createGoal, updateGoal, deleteGoal };