// server/socket/index.js - IMPROVED VERSION
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Room from '../models/Room.js';

export const setupSocket = (io) => {

  // ── Auth middleware for socket connections ──
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      
      if (!token) {
        console.log('❌ Socket auth failed: No token');
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name avatar email');
      
      if (!user) {
        console.log('❌ Socket auth failed: User not found');
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      
      console.log(`✅ Socket authenticated: ${user.name} (${user._id})`);
      next();
    } catch (error) {
      console.log('❌ Socket auth error:', error.message);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.name} (ID: ${socket.id})`);

    // ── User joins their personal notification room ──
    socket.on('authenticate', (userId) => {
      socket.join(userId);
      console.log(`👤 User ${socket.user.name} joined personal room: ${userId}`);
    });

    // ── Join a study room ──
    socket.on('room:join', async ({ roomId }) => {
      try {
        console.log(`📥 ${socket.user.name} attempting to join room ${roomId}`);
        
        const room = await Room.findById(roomId);
        
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if user is a member
        const isMember = room.members.some(
          m => m.toString() === socket.userId
        );

        if (!isMember) {
          socket.emit('error', { message: 'You are not a member of this room' });
          return;
        }

        // Join the room
        socket.join(roomId);

        // Notify others in the room
        socket.to(roomId).emit('room:user_joined', {
          user: {
            _id: socket.user._id,
            name: socket.user.name,
            avatar: socket.user.avatar
          },
          timestamp: new Date()
        });

        // Send message history to the joining user
        const populated = await Room.findById(roomId)
          .populate('messages.user', 'name avatar')
          .select('messages');

        socket.emit('room:history', {
          messages: populated?.messages.slice(-50) || []
        });

        console.log(`✅ ${socket.user.name} joined room ${roomId}`);
        
      } catch (err) {
        console.error('❌ Error joining room:', err);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // ── Leave a study room ──
    socket.on('room:leave', ({ roomId }) => {
      socket.leave(roomId);
      
      socket.to(roomId).emit('room:user_left', {
        user: {
          _id: socket.user._id,
          name: socket.user.name,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
      
      console.log(`👋 ${socket.user.name} left room ${roomId}`);
    });

    // ── Send a chat message ──
    socket.on('room:message', async ({ roomId, content }) => {
      try {
        if (!content || typeof content !== 'string' || !content.trim()) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        console.log(`💬 ${socket.user.name} sending message to room ${roomId}`);

        const room = await Room.findById(roomId);
        
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if user is a member
        const isMember = room.members.some(
          m => m.toString() === socket.userId
        );

        if (!isMember) {
          socket.emit('error', { message: 'You are not a member of this room' });
          return;
        }

        // Create message object
        const message = {
          user: socket.user._id,
          content: content.trim(),
          createdAt: new Date()
        };

        // Save to database
        room.messages.push(message);
        await room.save();

        // Broadcast to entire room (including sender)
        io.to(roomId).emit('room:new_message', {
          _id: room.messages[room.messages.length - 1]._id,
          user: {
            _id: socket.user._id,
            name: socket.user.name,
            avatar: socket.user.avatar
          },
          content: message.content,
          createdAt: message.createdAt
        });

        console.log(`✅ Message sent in room ${roomId}`);
        
      } catch (err) {
        console.error('❌ Error sending message:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ── Typing indicator ──
    socket.on('room:typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('room:user_typing', {
        user: {
          _id: socket.user._id,
          name: socket.user.name
        },
        isTyping
      });
    });

    // ── Disconnect ──
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.user.name} - Reason: ${reason}`);
    });

    // ── Error handling ──
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  });
};