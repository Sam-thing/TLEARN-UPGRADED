// server/socket/socket.js - FIXED VERSION
import jwt from 'jsonwebtoken';
import Room from '../models/Room.js';
import notificationService from '../services/notificationService.js';

let io;

export const initializeSocket = (ioInstance) => {
  io = ioInstance;

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      socket.userId = decoded.id || decoded._id || decoded.userId;
      socket.userName = decoded.name || decoded.username || decoded.fullName || decoded.firstName || 'User';
      
      console.log('👤 Socket user authenticated:', {
        userId: socket.userId,
        userName: socket.userName
      });
      
      next();
    } catch (error) {
      console.error('❌ JWT verification failed:', error.message);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userName} (${socket.userId})`);

    // ✅ AUTHENTICATE - Join personal notification room
    socket.on('authenticate', (userId) => {
      socket.join(userId);
      console.log(`🔔 User ${userId} joined personal notification room`);
    });

    // Join chat room
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      socket.currentRoom = roomId;
      console.log(`👤 ${socket.userName} joined room: ${roomId}`);
      
      socket.to(roomId).emit('user-joined', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });

      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      const onlineCount = roomSockets ? roomSockets.size : 0;
      io.to(roomId).emit('room-users-update', { count: onlineCount });
    });

    // Leave room
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      console.log(`👋 ${socket.userName} left room: ${roomId}`);
      
      socket.to(roomId).emit('user-left', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });

      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      const onlineCount = roomSockets ? roomSockets.size : 0;
      io.to(roomId).emit('room-users-update', { count: onlineCount });
    });

    // Send message
    socket.on('send-message', async (data) => {
      const { roomId, message } = data;
      
      // Broadcast message to room
      io.to(roomId).emit('receive-message', {
        _id: Date.now().toString(),
        userId: socket.userId,
        userName: socket.userName,
        message,
        timestamp: new Date(),
        pending: true
      });

      // Notify other room members about new message
      try {
        const room = await Room.findById(roomId).populate('members', 'name');
        
        if (room) {
          for (const member of room.members) {
            if (member._id.toString() !== socket.userId) {
              await notificationService.roomMessage(
                member._id,
                roomId,
                room.name,
                socket.userName,
                message.substring(0, 50) // First 50 chars
              );
            }
          }
        }
      } catch (error) {
        console.error('Failed to send message notifications:', error);
      }
    });

    // Typing indicator
    socket.on('typing-start', (roomId) => {
      socket.to(roomId).emit('user-typing', {
        userId: socket.userId,
        userName: socket.userName
      });
    });

    socket.on('typing-stop', (roomId) => {
      socket.to(roomId).emit('user-stopped-typing', {
        userId: socket.userId
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userName}`);
      
      if (socket.currentRoom) {
        io.to(socket.currentRoom).emit('user-left', {
          userId: socket.userId,
          userName: socket.userName,
          timestamp: new Date()
        });

        setTimeout(() => {
          const roomSockets = io.sockets.adapter.rooms.get(socket.currentRoom);
          const onlineCount = roomSockets ? roomSockets.size : 0;
          io.to(socket.currentRoom).emit('room-users-update', { count: onlineCount });
        }, 100);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};