// server/routes/fileMessages.js - File Upload Routes
import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/auth.js';
import Message from '../models/Message.js';
import FileMessage from '../models/FileMessage.js';
import Room from '../models/Room.js';
import { getIO } from '../socket/socket.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploaded/files';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, videos
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'video/mp4', 'video/webm'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, documents, and videos allowed.'));
    }
  }
});

// Determine file type from mime type
const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.includes('pdf') || mimeType.includes('document') || 
      mimeType.includes('spreadsheet') || mimeType.includes('text')) {
    return 'document';
  }
  return 'other';
};

// Upload file to room
router.post('/room/:roomId', protect, upload.single('file'), async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
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

    // Create message
    const message = await Message.create({
      room: roomId,
      sender: req.user.id,
      senderName: req.user.name,
      content: `[File: ${req.file.originalname}]`,
      type: 'file'
    });

    // Create file message
    const fileUrl = `/uploaded/files/${req.file.filename}`;
    const fileType = getFileType(req.file.mimetype);

    const fileMessage = await FileMessage.create({
      message: message._id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileUrl,
      fileType,
      mimeType: req.file.mimetype,
      fileSize: req.file.size
    });

    // Populate sender info
    await message.populate('sender', 'name avatar');

    // Emit to room via Socket.io
    const io = getIO();
    io.to(roomId).emit('receive-message', {
      _id: message._id,
      userId: req.user.id,
      userName: req.user.name,
      message: message.content,
      content: message.content,
      type: 'file',
      fileUrl,
      fileName: req.file.originalname,
      fileType,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      timestamp: message.createdAt
    });

    // Update room's last activity
    room.lastActivity = new Date();
    await room.save();

    res.status(201).json({
      message,
      fileData: {
        fileUrl,
        fileName: req.file.originalname,
        fileType,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get file data for a message
router.get('/:messageId', protect, async (req, res) => {
  try {
    const { messageId } = req.params;

    const fileMessage = await FileMessage.findOne({ message: messageId });
    if (!fileMessage) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json(fileMessage);
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;