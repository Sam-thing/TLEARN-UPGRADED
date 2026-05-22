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
import path from 'path';
import rateLimit from 'express-rate-limit';

import { initializeSocket } from './socket/socket.js';
import { setupSocket } from './socket/index.js';

import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import audioMessageRoutes from './routes/audioMessages.js';
import settingsRoutes from './routes/settings.js';
import fileMessageRoutes from './routes/fileMessages.js';
import examRoutes from './routes/exams.js';
import flashcardRoutes from './routes/flashcards.js';
import calendarRoutes from './routes/calendar.js';
import authRoutes from './routes/auth.js';
import topicRoutes from './routes/topics.js';
import sessionRoutes from './routes/sessions.js';
import roomRoutes from './routes/rooms.js';
import notesRoutes from './routes/notes.js';
import goalsRouter from './routes/goals.js';
import progressRoutes from './routes/progress.js';
import userRoutes from './routes/user.js';
import aiRoutes from './routes/ai.js';

import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const app = express();
const httpServer = createServer(app);

app.set('trust proxy', 1);

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://tlearn-upgraded.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

const isAllowedOrigin = (origin) =>
  !origin || ALLOWED_ORIGINS.includes(origin) || /\.vercel\.app$/.test(origin);

app.use(cors({
  origin: (origin, cb) =>
    isAllowedOrigin(origin) ? cb(null, true) : cb(new Error('CORS: origin not allowed')),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));
app.options('*', cors());

app.use(helmet({
  frameguard: { action: 'deny' },
  hsts: process.env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests — please slow down' },
  skip: (req) => req.path === '/api/health',
});
app.use('/api', globalLimiter);

app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

const uploadDir = path.join(process.cwd(), 'uploaded');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use('/uploaded', express.static(uploadDir));

export const io = new Server(httpServer, {
  cors: {
    origin: isAllowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 20000,
  pingInterval: 25000,
});

setupSocket(io);
initializeSocket(io);

app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/audio', audioMessageRoutes);
app.use('/api/files', fileMessageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/goals', goalsRouter);
app.use('/api/exams', examRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use(errorHandler);

const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully`);
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB disconnected');
      process.exit(0);
    });
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); });
process.on('unhandledRejection', (err) => { console.error('Unhandled Rejection:', err); });

mongoose.connect(process.env.MONGODB_URI_UPGRADED || process.env.MONGODB_URI, {
  family: 4,
  serverSelectionTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 2,
})
.then(() => {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`✅ MongoDB connected → ${mongoose.connection.host}`);
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});