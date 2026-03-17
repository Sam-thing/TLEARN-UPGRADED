// server/socket/socket.js - Socket.io Setup
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://tlearn-upgraded.vercel.app"
      ],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["websocket"]
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔑 Decoded JWT token:', decoded); // DEBUG: See what's in the token
      
      socket.userId = decoded.id || decoded._id || decoded.userId;
      // Try multiple possible name fields
      socket.userName = decoded.name || decoded.username || decoded.fullName || decoded.firstName || 'User';
      
      console.log('👤 Socket user set:', {
        userId: socket.userId,
        userName: socket.userName,
        availableFields: Object.keys(decoded)
      });
      
      if (!socket.userName || socket.userName === 'User') {
        console.warn('⚠️ WARNING: userName not found in JWT token! Available fields:', Object.keys(decoded));
      }
      
      next();
    } catch (error) {
      console.error('❌ JWT verification failed:', error.message);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userName} (${socket.userId})`);

    // Join room
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      socket.currentRoom = roomId;
      console.log(`👤 ${socket.userName} joined room: ${roomId}`);
      
      // Notify others in room
      socket.to(roomId).emit('user-joined', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });

      // Send online users count
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

      // Update online count
      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      const onlineCount = roomSockets ? roomSockets.size : 0;
      io.to(roomId).emit('room-users-update', { count: onlineCount });
    });

    // Send message
    socket.on('send-message', (data) => {
      const { roomId, message } = data;
      
      // Broadcast to everyone in room (including sender)
      io.to(roomId).emit('receive-message', {
        _id: Date.now().toString(), // Temporary ID until saved to DB
        userId: socket.userId,
        userName: socket.userName,
        message,
        timestamp: new Date(),
        pending: true // Will be replaced when saved to DB
      });
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
        // Send user left notification with proper userName
        io.to(socket.currentRoom).emit('user-left', {
          userId: socket.userId,
          userName: socket.userName, // This should be set from JWT
          timestamp: new Date()
        });

        // Update online count
        setTimeout(() => {
          const roomSockets = io.sockets.adapter.rooms.get(socket.currentRoom);
          const onlineCount = roomSockets ? roomSockets.size : 0;
          io.to(socket.currentRoom).emit('room-users-update', { count: onlineCount });
        }, 100); // Small delay to ensure socket has left room
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