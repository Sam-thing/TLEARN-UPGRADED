// server/routes/goals.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import { catchAsync } from '../middleware/errorHandler.js';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
} from '../controllers/goalController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .patch(updateGoal)
  .delete(deleteGoal);

export default router;