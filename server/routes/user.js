import express from 'express';
import { updateUser } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js'; 

const router = express.Router();

router.put('/:id', protect, updateUser); 

export default router;