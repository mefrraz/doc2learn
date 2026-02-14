import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRoutes } from './routes/auth';
import { documentRoutes } from './routes/documents';
import { apiKeyRoutes } from './routes/api-keys';
import aiRoutes from './routes/ai';

const app = express();
const PORT = process.env.PORT || 3001;

// Determine allowed origins based on environment
const getAllowedOrigins = (): string[] => {
  const developmentOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ];

  const productionOrigins = [
    process.env.FRONTEND_URL, // Vercel frontend URL
    process.env.RENDER_EXTERNAL_URL, // Render backend URL (for testing)
  ].filter(Boolean) as string[];

  // In production, allow all origins if FRONTEND_URL is not set
  // This is useful for Vercel preview deployments
  if (process.env.NODE_ENV === 'production') {
    return productionOrigins.length > 0 ? productionOrigins : ['*'];
  }

  return developmentOrigins;
};

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // In production with wildcard, allow all
    if (allowedOrigins.includes('*')) {
      callback(null, true);
      return;
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    
    // Also allow any Vercel preview URL
    if (origin && (
      origin.includes('vercel.app') || 
      origin.includes('render.com')
    )) {
      callback(null, true);
      return;
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
