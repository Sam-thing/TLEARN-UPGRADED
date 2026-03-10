// server/routes/audioMessages.js - Voice Note Routes
import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/auth.js';
import Message from '../models/Message.js';
import AudioMessage from '../models/AudioMessage.js';
import Room from '../models/Room.js';
import { getIO } from '../socket/socket.js';

const router = express.Router();

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploaded/audio');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'voice-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

// POST /api/audio/room/:roomId - Upload voice note
router.post('/room/:roomId', protect, upload.single('audio'), async (req, res) => {
  try {
    const { roomId } = req.params;
    const { duration, waveformData } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    // Check if user is member of room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const isMember = room.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this room' });
    }

    // Create text message
    const message = await Message.create({
      room: roomId,
      sender: req.user.id,
      senderName: req.user.name,
      content: '[Voice Message]',
      type: 'audio'
    });

    // Create audio message
    const audioUrl = `/uploaded/audio/${req.file.filename}`;
    const audioMessage = await AudioMessage.create({
      message: message._id,
      audioUrl,
      duration: parseFloat(duration) || 0,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      waveformData: waveformData ? JSON.parse(waveformData) : []
    });

    // Populate sender info
    await message.populate('sender', 'name avatar');

    // Emit to room via Socket.io
    const io = getIO();
    io.to(roomId).emit('receive-message', {
      _id: message._id,
      userId: req.user.id,
      userName: req.user.name,
      message: '[Voice Message]',
      content: '[Voice Message]',
      type: 'audio',
      audioUrl,
      duration: audioMessage.duration,
      waveformData: audioMessage.waveformData,
      timestamp: message.createdAt
    });

    // Update room's last activity
    room.lastActivity = new Date();
    await room.save();

    res.status(201).json({
      message,
      audio: {
        audioUrl,
        duration: audioMessage.duration,
        waveformData: audioMessage.waveformData
      }
    });
  } catch (error) {
    console.error('Error uploading audio:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/audio/:messageId - Get audio message details
router.get('/:messageId', protect, async (req, res) => {
  try {
    const { messageId } = req.params;

    const audioMessage = await AudioMessage.findOne({ message: messageId })
      .populate({
        path: 'message',
        populate: { path: 'sender', select: 'name avatar' }
      });

    if (!audioMessage) {
      return res.status(404).json({ message: 'Audio message not found' });
    }

    res.json(audioMessage);
  } catch (error) {
    console.error('Error fetching audio message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;