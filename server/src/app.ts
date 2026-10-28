import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';
import { AUTH_COOKIE_NAME } from './utils/jwt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Trust proxy for reverse proxies / Cloudflare tunnels / Render
  app.set('trust proxy', 1);

  // Content Security Policy & Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Middleware: strictly restricted in production
  app.use(
    cors({
      origin: env.NODE_ENV === 'production' ? false : ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
    })
  );

  // Parsing Middleware
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));

  // CSRF / Origin Verification for Cookie-Authenticated State-Changing Requests
  app.use((req, res, next) => {
    const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    if (!isStateChanging || !req.cookies?.[AUTH_COOKIE_NAME]) {
      return next();
    }

    // Bypass during isolated automated testing or when using Authorization header
    if (env.NODE_ENV === 'test' || req.headers.authorization?.startsWith('Bearer ')) {
      return next();
    }

    const originHeader =
      req.headers.origin ||
      (req.headers.referer ? new URL(req.headers.referer).origin : null);

    if (!originHeader) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'State-changing request blocked: missing Origin or Referer header.',
        },
      });
      return;
    }

    const host = req.get('host');
    const isDirectHost = host ? originHeader.includes(host) : false;
    const isLocalDev =
      env.NODE_ENV !== 'production' &&
      (originHeader.includes('localhost') || originHeader.includes('127.0.0.1'));
    const isAllowedTunnel =
      originHeader.includes('trycloudflare.com') ||
      originHeader.includes('loca.lt') ||
      originHeader.includes('onrender.com');

    if (!isDirectHost && !isLocalDev && !isAllowedTunnel) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Cross-origin request blocked by CSRF origin verification.',
        },
      });
      return;
    }

    next();
  });

  // Health Endpoint
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'team-task-manager-api',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/activity', activityRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // 404 handler for unknown API routes - NEVER return HTML for /api
  app.all('/api/*', (_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'API route not found',
      },
    });
  });

  // Serve compiled React frontend in production
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));

    // SPA fallback: return index.html for all non-API GET requests
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}
