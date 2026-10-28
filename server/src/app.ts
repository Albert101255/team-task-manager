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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Security Middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Vite scripts and fonts in single-origin deployment
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Middleware
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
