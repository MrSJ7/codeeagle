import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health.routes.js';
import reviewRouter from './routes/review.routes.js';
import rulesRouter from './routes/rules.routes.js';
import patchRouter from './routes/patch.routes.js';
import reviewsRouter from './routes/reviews.routes.js';
import projectRouter from './routes/project.routes.js';
import { fileURLToPath } from 'url';
import { connectDatabase } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Known production and preview frontend origins
const defaultOrigins = [
  'https://codeeagle.vercel.app',
  'https://code-reviewer-delta-fawn.vercel.app',
  'https://codelens.vercel.app',
];

// Allowed frontend origins from environment (supports comma/space separated lists)
const rawConfiguredOrigins = [
  process.env.FRONTEND_ORIGIN,
  process.env.CLIENT_URL,
].filter(Boolean);

const configuredOrigins = rawConfiguredOrigins
  .flatMap((entry) => entry.split(/[\s,]+/))
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

export function isOriginAllowed(origin) {
  // Allow non-browser requests: curl, health monitors, server-to-server
  if (!origin) {
    return true;
  }

  const cleanOrigin = origin.replace(/\/+$/, '');

  // Allow wildcard if configured
  if (configuredOrigins.includes('*')) {
    return true;
  }

  // Allow any Vercel domain (e.g. https://codeeagle.vercel.app, preview deployments, custom aliases)
  const isVercel = /^https?:\/\/([a-zA-Z0-9_-]+\.)*vercel\.app$/.test(cleanOrigin);
  if (isVercel) {
    return true;
  }

  // Allow localhost / local loopback variants in all environments
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin);
  if (isLocalhost) {
    return true;
  }

  // Explicitly configured or default recognized domains
  if (configuredOrigins.includes(cleanOrigin) || defaultOrigins.includes(cleanOrigin)) {
    return true;
  }

  // Development: allow all if no explicit origins configured
  if (process.env.NODE_ENV !== 'production' && configuredOrigins.length === 0) {
    return true;
  }

  return false;
}

// Lightweight production security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Environment-aware CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin not allowed by CORS policy.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '35mb' }));

app.use('/api/health', healthRouter);
app.use('/api/review', reviewRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/patch', patchRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/projects', projectRouter);

// Catch-all 404 handler for undefined API routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
    },
  });
});

// Centralized error-handling middleware
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: {
        code: 'CORS_FORBIDDEN',
        message: 'Origin not allowed by CORS policy.',
      },
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(400).json({
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload exceeds maximum allowed size (500 KB).',
      },
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: {
        code: 'MALFORMED_JSON',
        message: 'Request body contains invalid JSON.',
      },
    });
  }

  console.error('[Unhandled Server Error]:', err.message);
  return res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: 'An unexpected internal error occurred.',
    },
  });
});

// Attempt database connection without blocking startup
connectDatabase().catch((err) => {
  console.warn('[Database] Initial connection error:', err.message);
});

// Only listen when run directly as main entry point and not in a serverless environment
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (!process.env.VERCEL && isMainModule) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;
