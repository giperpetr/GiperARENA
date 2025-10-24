// GiperARENA Backend API Server
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { APP_NAME, API_VERSION } from '@giperarena/shared';
import './config/database';
import './config/redis';
import './config/supabase';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    service: `${APP_NAME} Backend`,
    version: API_VERSION,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.get(`/api/${API_VERSION}`, (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: `Welcome to ${APP_NAME} API ${API_VERSION}`,
    endpoints: {
      health: '/health',
      api: `/api/${API_VERSION}`,
      users: `/api/${API_VERSION}/users`,
      arenas: `/api/${API_VERSION}/arenas`,
      sessions: `/api/${API_VERSION}/sessions`,
      tournaments: `/api/${API_VERSION}/tournaments`,
      bets: `/api/${API_VERSION}/bets`,
      nfts: `/api/${API_VERSION}/nfts`,
      wallets: `/api/${API_VERSION}/wallets`,
      docs: `/api/${API_VERSION}/docs`,
    },
  });
});

// Mount API routes
app.use(`/api/${API_VERSION}`, routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: Function) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ${APP_NAME} Backend API`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});

export default app;
