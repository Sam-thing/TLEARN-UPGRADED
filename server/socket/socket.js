// server/socket/socket.js - Socket.io Setup
import jwt from 'jsonwebtoken';

let io;

export const initializeSocket = (ioInstance) => {  // ← Accept io instance
  io = ioInstance;  // ← Use passed instance, don't create new one

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔑 Decoded JWT token:', decoded);
      
      socket.userId = decoded.id || decoded._id || decoded.userId;
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
    socket.on('send-message', (data) => {
      const { roomId, message } = data;
      
      io.to(roomId).emit('receive-message', {
        _id: Date.now().toString(),
        userId: socket.userId,
        userName: socket.userName,
        message,
        timestamp: new Date(),
        pending: true
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

// Handle personal notifications
socket.on('authenticate', (userId) => {
  socket.join(userId);
  console.log(`👤 User ${userId} joined personal notification room`);
});