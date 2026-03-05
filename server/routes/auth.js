// routes/auth.js
import { Router } from 'express';
import { register, login, getMe, updateProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login',    login);
router.get ('/me',       protect, getMe);
router.patch('/profile', protect, updateProfile);
router.patch('/password',protect, changePassword);

export default router;