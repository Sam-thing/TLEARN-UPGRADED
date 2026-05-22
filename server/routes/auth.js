// routes/auth.js — with rate limiters wired in
import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  loginRateLimiter,
  registerRateLimiter,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerRateLimiter, register);
router.post('/login',    loginRateLimiter,    login);
router.get ('/me',       protect,             getMe);
router.patch('/profile', protect,             updateProfile);
router.patch('/password',protect,             changePassword);

export default router;