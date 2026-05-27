// server.js — hardened security + performance
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
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import audioMessageRoutes from './routes/audioMessages.js';
import settingsRoutes from './routes/settings.js';
import fileMessageRoutes from './routes/fileMessages.js';
import examRoutes from './routes/exams.js';
import flashcardRoutes from './routes/flashcards.js';
import calendarRoutes from './routes/calendar.js';
import authRoutes     from './routes/auth.js';
import topicRoutes    from './routes/topics.js';
import sessionRoutes  from './routes/sessions.js';
import roomRoutes     from './routes/rooms.js';
import notesRoutes    from './routes/notes.js';
import goalsRouter from './routes/goals.js';
import progressRoutes from './routes/progress.js';
import userRoutes from './routes/user.js';
import aiRoutes from './routes/ai.js';
import avatarRoutes from './routes/avatar.js'
// import gamificationRoutes from './routes/gamification.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupSocket }  from './socket/index.js';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const app        = express();
const httpServer = createServer(app);

// ── ALLOWED ORIGINS ────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://tlearn-upgraded.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

const isAllowedOrigin = (origin) =>
  !origin ||
  ALLOWED_ORIGINS.includes(origin) ||
  /\.vercel\.app$/.test(origin);

// ── CORS (must be before helmet) ───────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) =>
    isAllowedOrigin(origin) ? cb(null, true) : cb(new Error('CORS: origin not allowed')),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // cache preflight for 24h
}));
app.options('*', cors());

// ── SECURITY HEADERS (helmet) ──────────────────────────────────────────────────
app.use(helmet({
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  // Force HTTPS in production
  hsts: process.env.NODE_ENV === 'production'
    ? { maxAge: 31536000, includeSubDomains: true }
    : false,
  // Block MIME sniffing
  noSniff: true,
  // XSS filter (legacy browsers)
  xssFilter: true,
  // Hide X-Powered-By
  hidePoweredBy: true,
  // Relax CSP for API (not serving HTML)
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

// ── GLOBAL RATE LIMIT (all routes) ─────────────────────────────────────────────
// Separate, tighter limits exist on /auth/login and /auth/register
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,                  // 500 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests — please slow down' },
  skip: (req) => req.path === '/api/health', // don't rate-limit health checks
});
app.use('/api', globalLimiter);

// ── BODY PARSING ───────────────────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));          // was 10mb — 2mb is plenty for JSON
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── STATIC UPLOADS ─────────────────────────────────────────────────────────────
const uploadDir = path.join(process.cwd(), 'uploaded');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use('/uploaded', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  // Cache static files for 7 days
  res.header('Cache-Control', 'public, max-age=604800, immutable');
  next();
}, express.static(uploadDir));

// ── SOCKET.IO ──────────────────────────────────────────────────────────────────
export const io = new Server(httpServer, {
  cors: {
    origin: isAllowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  // Reduce memory pressure
  pingTimeout: 20000,
  pingInterval: 25000,
});

setupSocket(io);
initializeSocket(io);

// ── API ROUTES ─────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/topics',        topicRoutes);
app.use('/api/sessions',      sessionRoutes);
app.use('/api/rooms',         roomRoutes);
app.use('/api/notes',         notesRoutes);
app.use('/api/ai',            aiRoutes);
app.use('/api/progress',      progressRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/audio',         audioMessageRoutes);
app.use('/api/files',         fileMessageRoutes);
app.use('/api/settings',      settingsRoutes);
app.use('/api/goals',         goalsRouter);
app.use('/api/exams',         examRoutes);
app.use('/api/avatar',        avatarRoutes)
app.use('/api/flashcards',    flashcardRoutes);
app.use('/api/calendar',      calendarRoutes);
app.use('/api/notifications', notificationRoutes);
// app.use('/api/gamification',  gamificationRoutes);

// ── HEALTH ─────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ── ERROR HANDLER ──────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── GRACEFUL SHUTDOWN ──────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully`);
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB disconnected');
      process.exit(0);
    });
  });
  setTimeout(() => process.exit(1), 10000); // Force exit after 10s
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('uncaughtException',  (err) => { console.error('Uncaught Exception:', err);  });
process.on('unhandledRejection', (err) => { console.error('Unhandled Rejection:', err); });

// ── CONNECT & START ────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI_UPGRADED || process.env.MONGODB_URI, {
  family: 4,
  serverSelectionTimeoutMS: 10000,
  // Connection pool — handles concurrent requests without bottleneck
  maxPoolSize: 10,
  minPoolSize: 2,
})
.then(() => {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`✅  MongoDB connected → ${mongoose.connection.host}`);
    console.log(`🚀  Server → http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('❌  MongoDB connection failed:', err.message);
  process.exit(1);
});