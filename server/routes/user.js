import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/user/profile  → Fetch full profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password');   // Never send password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      institution: user.institution,
      level: user.level,
      bio: user.bio,
      avatar: user.avatar,
      streak: user.streak,
      stats: user.stats,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/user/profile  → Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, institution, level, bio, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        name, 
        institution, 
        level, 
        bio, 
        avatar 
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        institution: updatedUser.institution,
        level: updatedUser.level,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        streak: updatedUser.streak,
        stats: updatedUser.stats
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;