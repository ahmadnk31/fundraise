import { VercelRequest, VercelResponse } from '@vercel/node';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Use serverless-optimized database connection
import '../src/lib/db-serverless.js';

// Import routes
import authRoutes from '../src/routes/auth.routes.js';
import campaignRoutes from '../src/routes/campaign.routes.js';
import uploadRoutes from '../src/routes/upload.routes.js';
import userRoutes from '../src/routes/user.routes.js';
import donationRoutes from '../src/routes/donation.routes.js';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8080',
    'https://fundraise-inky.vercel.app',
    'https://fundraise-7e3nm2la2-ahmadnk31s-projects.vercel.app',
    'https://fundraise-csmdni4m3-ahmadnk31s-projects.vercel.app',
    /^https:\/\/fundraise-.*\.vercel\.app$/,
    /\.vercel\.app$/,
    /^https:\/\/.*\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
}));

// Raw body parsing for Stripe webhooks
app.use('/api/donations/webhook', express.raw({ type: 'application/json' }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: process.env.DATABASE_URL ? 'configured' : 'missing'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
});

// Export for Vercel
export default app;
