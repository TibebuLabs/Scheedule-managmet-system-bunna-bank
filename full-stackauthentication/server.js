require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// const mongoSanitize = require('express-mongo-sanitize'); // Temporarily disabled - need to run: npm install
const authRoutes = require('./routes/auth.routes');
const staffRoutes = require('./routes/staff.routes');
const taskRoutes = require('./routes/task.routes');
const scheduleRoutes = require('./routes/schedule.routes');
// const dailyScheduleRoutes = require('./routes/dailySchedule.routes');
const emailRoutes = require('./routes/email.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection configuration
let dbRetryCount = 0;
const MAX_DB_RETRIES = 5;
const DB_RETRY_INTERVAL = 10000; // 10 seconds

// Rate Limiting - Auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs for auth
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Rate Limiting - General API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for development
}));

// Support multiple FRONTEND_URL values (comma-separated or single)
const rawFrontendUrls = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(u => u.trim())
  .filter(Boolean);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://scheedule-managmet-system-bunna-bank-1.onrender.com',
  ...rawFrontendUrls,
].filter(Boolean);

console.log('🔒 CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow exact matches from allowedOrigins
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Allow any onrender.com origin matching the project
    if (/^https:\/\/scheedule-managmet-system-bunna-bank(-\d+)?\.onrender\.com$/.test(origin)) {
      return callback(null, true);
    }


    callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(mongoSanitize()); // Temporarily disabled - install with: npm install express-mongo-sanitize
app.use(limiter);

// Database connection with retry logic
async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task_scheduler', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
    dbRetryCount = 0; // Reset retry count on successful connection
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);

    if (err.message.includes('ECONNREFUSED')) {
      console.log('⚠️  MongoDB server is not running or not accessible');
      console.log('🔧 Please ensure MongoDB is installed and running:');
      console.log('   - Windows: Run "mongod" or start MongoDB service');
      console.log('   - Linux/Mac: Run "sudo systemctl start mongod" or "brew services start mongodb"');

      // Retry logic for development
      if (process.env.NODE_ENV !== 'production' && dbRetryCount < MAX_DB_RETRIES) {
        dbRetryCount++;
        console.log(`🔄 Retrying database connection (attempt ${dbRetryCount}/${MAX_DB_RETRIES}) in ${DB_RETRY_INTERVAL / 1000}s...`);
        setTimeout(connectDatabase, DB_RETRY_INTERVAL);
      } else if (dbRetryCount >= MAX_DB_RETRIES) {
        console.log('❌ Maximum retry attempts reached. Server will continue without database.');
        console.log('⚠️  Some features will be unavailable until database connection is established.');
      }
    }

    // Don't exit in development or serverless environments
    if (process.env.NODE_ENV === 'production') {
      // In production, you might want to exit and let a process manager restart the app.
      // Uncomment the line below if you want the process to exit:
      // process.exit(1);
    }
  }
}

// Initial connection
connectDatabase();

// Connection events
mongoose.connection.on('connected', () => {
  console.log('📊 MongoDB connected');
  dbRetryCount = 0;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
  // Attempt reconnection in development
  if (process.env.NODE_ENV !== 'production' && dbRetryCount < MAX_DB_RETRIES) {
    console.log('🔄 Attempting to reconnect to MongoDB...');
    setTimeout(connectDatabase, DB_RETRY_INTERVAL);
  }
});

// Request logging middleware with timestamp
app.use((req, res, next) => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const startTime = Date.now();

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${timestamp}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });

  next();
});

// Routes
app.use('/api/auth', authLimiter, authRoutes); // Apply strict rate limiting to auth routes
app.use('/api/staff', staffRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/schedules', scheduleRoutes);
// app.use('/api/daily-schedules', dailyScheduleRoutes);
app.use('/api/email', emailRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const emailStatus = (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) ? 'configured' : 'not configured';

  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    email: emailStatus,
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Task Scheduler API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      staff: '/api/staff',
      tasks: '/api/tasks',
      schedules: '/api/schedules',
      dailySchedules: '/api/daily-schedules',
      email: '/api/email'
    },
    health: '/health',
    documentation: 'Coming soon...'
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Log error details
  console.error('🔥 Server Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      errors: Object.values(err.errors).map(e => e.message),
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      code: 'INVALID_ID',
      timestamp: new Date().toISOString()
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry detected',
      code: 'DUPLICATE_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    success: false,
    message: message,
    code: err.code || 'SERVER_ERROR',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack
    })
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Task Management System - Server Started');
  console.log('='.repeat(60));
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Database: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '⚠️  Disconnected'}`);
  console.log(`📧 Email: ${(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) ? '✅ Configured' : '⚠️  Not configured'}`);
  console.log('\n📡 Available Routes:');
  console.log('   - Auth:      /api/auth');
  console.log('   - Staff:     /api/staff');
  console.log('   - Tasks:     /api/tasks');
  console.log('   - Schedules: /api/schedules');
  console.log('   - Email:     /api/email');
  console.log('='.repeat(60) + '\n');

  // Warnings
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('⚠️  WARNING: Email credentials not configured. Email features will be unavailable.');
    console.log('   Set EMAIL_USER and EMAIL_PASSWORD in .env file\n');
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key') {
    console.log('🔐 WARNING: Using default/weak JWT_SECRET. Change this in production!');
    console.log('   Set a strong JWT_SECRET in .env file (minimum 32 characters)\n');
  }
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('\n🛑 Received shutdown signal');

  server.close(async () => {
    console.log('🔒 HTTP server closed');

    try {
      await mongoose.connection.close();
      console.log('📊 MongoDB connection closed');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during shutdown:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⏰ Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
