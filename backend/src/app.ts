import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import ngoManagementRoutes from './routes/ngoManagementRoutes';
import studentManagementRoutes from './routes/studentManagementRoutes';
import courseRoutes from './routes/courseRoutes';
import applicationRoutes from './routes/applicationRoutes';
import ngoRoutes from './routes/ngoRoutes';
import publicRoutes from './routes/publicRoutes';
import { notFound, errorHandler } from './utils/errors';

/**
 * Express app factory.
 * Kept separate from server.js so it can be imported in tests.
 */
export function createApp(): Application {
  const app = express();

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: config.clientOrigin,
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Rate limiting — stricter for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // 👈 Temporary high number so localhost won't lock you out
    // windowMs: config.rateLimit.windowMs,
    // max: config.rateLimit.authMax,
    message: { message: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/admin/ngos', ngoManagementRoutes);
  app.use('/api/admin/students', studentManagementRoutes);
  app.use('/api/admin/courses', courseRoutes);
  app.use('/api/admin/applications', applicationRoutes);
  app.use('/api/ngo', ngoRoutes);
  app.use('/api/public', publicRoutes);

  // 404 + error handling
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
