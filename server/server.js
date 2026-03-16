// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import dns from 'dns';
import fs from 'fs';        
import { initializeSocket } from './socket/socket.js'; 
import messageRoutes from './routes/messages.js'; 
import notificationRoutes from './routes/notifications.js';
import audioMessageRoutes from './routes/audioMessages.js';
import settingsRoutes from './routes/settings.js';
import fileMessageRoutes from './routes/fileMessages.js';

import authRoutes     from './routes/auth.js';
import topicRoutes    from './routes/topics.js';
import sessionRoutes  from './routes/sessions.js';
import roomRoutes     from './routes/rooms.js';
import notesRoutes    from './routes/notes.js';
import progressRoutes from './routes/progress.js';
import userRoutes from './routes/user.js';

import { errorHandler } from './middleware/errorHandler.js';
import { setupSocket }  from './socket/index.js';

dotenv.config();
dns.setServers(['8.8.8.8']);

const app        = express();
const httpServer = createServer(app);

// ── Socket.io Setup (Combined) ──────────────────────────
export const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://tlearn-upgraded.vercel.app",
      /\.vercel\.app$/
    ],
    credentials: true
  }
});

// Setup existing socket functionality (teaching sessions, etc.)
setupSocket(io);

// Setup new chat socket functionality (real-time messaging)
initializeSocket(httpServer);
console.log('🔌 Chat Socket.io initialized');

// ── Middleware ─────────────────────────────────────────
app.use(helmet());
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://tlearn-upgraded.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Create upload directory if it doesn't exist ────────
import path from 'path';

const uploadDir = path.join(process.cwd(), 'uploaded');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created upload directory');
}

// ── Serve uploaded files as static with CORS ──────────────────────
app.use('/uploaded', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadDir));

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/topics',   topicRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/rooms',    roomRoutes);
app.use('/api/notes',    notesRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/messages', messageRoutes); 
app.use('/api/audio', audioMessageRoutes);
app.use('/api/files', fileMessageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);

// ── Health ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ── Error handler ──────────────────────────────────────
app.use(errorHandler);


// ── Connect & Start ────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI_UPGRADED || process.env.MONGODB_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`🚀  Server → http://localhost:${PORT}`);
      console.log(`📁  Uploads available at → http://localhost:${PORT}/uploaded`);
      console.log(`💬  Chat system ready`);
    });
  })
  .catch((err) => {
    console.error('❌  MongoDB error:', err.message);
    process.exit(1);
  });