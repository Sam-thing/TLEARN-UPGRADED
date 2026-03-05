// socket/index.js
import jwt      from 'jsonwebtoken';
import User     from '../models/User.js';
import Room     from '../models/Room.js';

export const setupSocket = (io) => {

  // ── Auth middleware for socket connections ──
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).select('name avatar');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌  Socket connected: ${socket.user.name}`);

    // ── Join a study room ──
    socket.on('room:join', async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        socket.join(roomId);

        // Notify others
        socket.to(roomId).emit('room:user_joined', {
          user:      socket.user,
          timestamp: new Date()
        });

        // Send last 50 messages to the joining user
        const populated = await Room.findById(roomId)
          .populate('messages.user', 'name avatar')
          .select('messages');

        socket.emit('room:history', {
          messages: populated.messages.slice(-50)
        });

        console.log(`👥  ${socket.user.name} joined room ${roomId}`);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ── Leave a study room ──
    socket.on('room:leave', ({ roomId }) => {
      socket.leave(roomId);
      socket.to(roomId).emit('room:user_left', {
        user:      socket.user,
        timestamp: new Date()
      });
    });

    // ── Send a chat message ──
    socket.on('room:message', async ({ roomId, content }) => {
      try {
        if (!content?.trim()) return;

        const room = await Room.findById(roomId);
        if (!room) return;

        const message = {
          user:      socket.user._id,
          content:   content.trim(),
          createdAt: new Date()
        };

        room.messages.push(message);
        await room.save();

        // Broadcast to entire room (including sender)
        io.to(roomId).emit('room:new_message', {
          ...message,
          user: socket.user  // send full user object for display
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ── Typing indicator ──
    socket.on('room:typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('room:user_typing', {
        user:     socket.user,
        isTyping
      });
    });

    // ── Disconnect ──
    socket.on('disconnect', () => {
      console.log(`🔌  Socket disconnected: ${socket.user.name}`);
    });
  });
};