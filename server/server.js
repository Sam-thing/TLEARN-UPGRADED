// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import dns from 'dns';          // <-- ESM import instead of require

import authRoutes     from './routes/auth.js';
import topicRoutes    from './routes/topics.js';
import sessionRoutes  from './routes/sessions.js';
import roomRoutes     from './routes/rooms.js';
import notesRoutes    from './routes/notes.js';
import progressRoutes from './routes/progress.js';
import { updateUser } from './controllers/userController.js';
import userRoutes from './routes/user.js';

import { errorHandler } from './middleware/errorHandler.js';
import { setupSocket }  from './socket/index.js';

dotenv.config();
dns.setServers(['8.8.8.8']);

const app        = express();
const httpServer = createServer(app);

// ── Socket.io ──────────────────────────────────────────
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});
setupSocket(io);

// ── Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/topics',   topicRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/rooms',    roomRoutes);
app.use('/api/notes',    notesRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/users', userRoutes);

// ── Health ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ── Error handler ──────────────────────────────────────
app.use(errorHandler);


// ── Connect & Start ────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI_upgraded || process.env.MONGODB_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    httpServer.listen(process.env.PORT || 5000, () => {
      console.log(`🚀  Server → http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('❌  MongoDB error:', err.message);
    process.exit(1);
  });