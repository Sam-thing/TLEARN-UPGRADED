// server/routes/avatar.js
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

const router = Router();

// ── Storage ────────────────────────────────────────────────────────────────────
const AVATAR_DIR = path.join(process.cwd(), 'uploaded', 'avatars');
if (!fs.existsSync(AVATAR_DIR)) fs.mkdirSync(AVATAR_DIR, { recursive: true });

const storage = multer.memoryStorage(); // buffer first — we process with sharp

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max upload
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new AppError('Only JPEG, PNG, WebP or GIF images are allowed', 400));
    }
    cb(null, true);
  },
});

// ── POST /api/avatar ───────────────────────────────────────────────────────────
router.post(
  '/',
  protect,
  upload.single('avatar'),
  catchAsync(async (req, res) => {
    if (!req.file) throw new AppError('No image file provided', 400);

    const userId   = String(req.user._id);
    const filename = `${userId}-${Date.now()}.webp`;
    const filepath = path.join(AVATAR_DIR, filename);

    // Resize & convert to WebP — keeps files small (~15-40 KB) and consistent
    await sharp(req.file.buffer)
      .resize(256, 256, {
        fit: 'cover',        // crop to square
        position: 'center',
      })
      .webp({ quality: 85 })
      .toFile(filepath);

    // Delete previous avatar file if it was one we stored (not an external URL)
    if (req.user.avatar) {
      const oldMatch = req.user.avatar.match(/\/uploaded\/avatars\/(.+)$/);
      if (oldMatch) {
        const oldPath = path.join(AVATAR_DIR, oldMatch[1]);
        fs.unlink(oldPath, () => {}); // best-effort, ignore errors
      }
    }

    // Build the public URL
    const avatarUrl = `/uploaded/avatars/${filename}`;

    // Persist to DB
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { avatar: avatarUrl } },
      { new: true }
    ).select('-password');

    if (!user) throw new AppError('User not found', 404);

    res.json({
      avatar: avatarUrl,
      user: {
        id:          user._id,
        name:        user.name,
        email:       user.email,
        institution: user.institution,
        level:       user.level,
        bio:         user.bio,
        avatar:      user.avatar,
        stats:       user.stats,
        streak:      user.streak,
      },
    });
  })
);

// ── DELETE /api/avatar ─────────────────────────────────────────────────────────
router.delete(
  '/',
  protect,
  catchAsync(async (req, res) => {
    if (req.user.avatar) {
      const match = req.user.avatar.match(/\/uploaded\/avatars\/(.+)$/);
      if (match) {
        const filePath = path.join(AVATAR_DIR, match[1]);
        fs.unlink(filePath, () => {});
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { avatar: '' } },
      { new: true }
    ).select('-password');

    res.json({ avatar: null, user });
  })
);

export default router;