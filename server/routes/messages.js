// server/routes/messages.js - Message Routes
import express from 'express';
import { protect } from '../middleware/auth.js';
import Message from '../models/Message.js';
import Room from '../models/Room.js';

const router = express.Router();

// Get messages for a room (with pagination)
router.get('/room/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;

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

    // Build query
    const query = { room: roomId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Fetch messages
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sender', 'name avatar')
      .lean();

    // For audio messages, fetch audio data
    const AudioMessage = (await import('../models/AudioMessage.js')).default;
    
    const messagesWithAudio = await Promise.all(
      messages.map(async (msg) => {
        // Base message with normalized userId
        const normalizedMsg = {
          ...msg,
          userId: msg.sender?._id || msg.sender
        };

        if (msg.type === 'audio') {
          const audioData = await AudioMessage.findOne({ message: msg._id }).lean();
          if (audioData) {
            return {
              ...normalizedMsg,
              audioUrl: audioData.audioUrl,
              duration: audioData.duration,
              waveformData: audioData.waveformData
            };
          }
        }
        return normalizedMsg;
      })
    );

    // For file messages, fetch file data
    const FileMessage = (await import('../models/FileMessage.js')).default;
    
    const messagesWithFiles = await Promise.all(
      messagesWithAudio.map(async (msg) => {
        if (msg.type === 'file') {
          const fileData = await FileMessage.findOne({ message: msg._id }).lean();
          if (fileData) {
            return {
              ...msg,
              fileUrl: fileData.fileUrl,
              fileName: fileData.originalName,
              fileType: fileData.fileType,
              fileSize: fileData.fileSize,
              mimeType: fileData.mimeType
            };
          }
        }
        return msg;
      })
    );

    res.json({
      messages: messagesWithFiles.reverse(),
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message (also saved to DB)
router.post('/room/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Check if user is member
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
      content: content.trim(),
      type: 'text'
    });

    // Populate sender info
    await message.populate('sender', 'name avatar');

    // Update room's last activity
    room.lastActivity = new Date();
    await room.save();

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.post('/room/:roomId/read', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { messageIds } = req.body;

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        room: roomId,
        'readBy.user': { $ne: req.user.id }
      },
      {
        $push: {
          readBy: {
            user: req.user.id,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// React to message
router.post('/:messageId/react', protect, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Initialize reactions if not exists
    if (!message.reactions) {
      message.reactions = new Map();
    }

    // Toggle reaction
    const reactions = message.reactions.get(emoji) || [];
    const userIndex = reactions.indexOf(req.user.id);
    
    if (userIndex > -1) {
      // Remove reaction
      reactions.splice(userIndex, 1);
    } else {
      // Add reaction
      reactions.push(req.user.id);
    }

    if (reactions.length === 0) {
      message.reactions.delete(emoji);
    } else {
      message.reactions.set(emoji, reactions);
    }

    await message.save();

    // Emit via socket
    const io = (await import('../socket/socket.js')).getIO();
    io.to(message.room.toString()).emit('message-reacted', {
      messageId: message._id,
      reactions: Object.fromEntries(message.reactions)
    });

    res.json({ 
      messageId: message._id,
      reactions: Object.fromEntries(message.reactions)
    });
  } catch (error) {
    console.error('Error reacting to message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit message
router.patch('/:messageId', protect, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    // Emit via socket
    const io = (await import('../socket/socket.js')).getIO();
    io.to(message.room.toString()).emit('message-edited', {
      messageId: message._id,
      content: message.content,
      isEdited: true,
      editedAt: message.editedAt
    });

    res.json(message);
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message
router.delete('/:messageId', protect, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await message.deleteOne();

    // Emit via socket
    const io = (await import('../socket/socket.js')).getIO();
    io.to(message.room.toString()).emit('message-deleted', {
      messageId: message._id
    });

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pin/Unpin message
router.post('/:messageId/pin', protect, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is member of room
    const room = await Room.findById(message.room);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const isMember = room.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Toggle pin
    message.isPinned = !message.isPinned;
    message.pinnedAt = message.isPinned ? new Date() : null;
    message.pinnedBy = message.isPinned ? req.user.id : null;
    await message.save();

    // Emit via socket
    const io = (await import('../socket/socket.js')).getIO();
    io.to(message.room.toString()).emit('message-pinned', {
      messageId: message._id,
      isPinned: message.isPinned,
      pinnedAt: message.pinnedAt
    });

    res.json({
      messageId: message._id,
      isPinned: message.isPinned,
      pinnedAt: message.pinnedAt
    });
  } catch (error) {
    console.error('Error pinning message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pinned messages for a room
router.get('/room/:roomId/pinned', protect, async (req, res) => {
  try {
    const { roomId } = req.params;

    // Check if user is member
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const isMember = room.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get pinned messages
    const pinnedMessages = await Message.find({
      room: roomId,
      isPinned: true
    })
      .sort({ pinnedAt: -1 })
      .populate('sender', 'name avatar')
      .populate('pinnedBy', 'name')
      .lean();

    res.json({ pinnedMessages });
  } catch (error) {
    console.error('Error fetching pinned messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/room/:roomId/read', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { messageIds } = req.body;

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        room: roomId,
        'readBy.user': { $ne: req.user.id }
      },
      {
        $push: {
          readBy: {
            user: req.user.id,
            userName: req.user.name,  // ← ADD THIS
            readAt: new Date()
          }
        }
      }
    );

    // Emit via socket
    const io = (await import('../socket/socket.js')).getIO();
    io.to(roomId).emit('messages-read', {
      messageIds,
      userId: req.user.id,
      userName: req.user.name
    });

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;