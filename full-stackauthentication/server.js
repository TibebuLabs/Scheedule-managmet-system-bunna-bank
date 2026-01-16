require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth.routes');
const staffRoutes = require('./routes/staff.routes');
const taskRoutes = require('./routes/task.routes');
const scheduleRoutes = require('./routes/schedule.routes');
// const dailyScheduleRoutes = require('./routes/dailySchedule.routes');
const emailRoutes = require('./routes/email.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { 
    success: false, 
    message: 'Too many requests, please try again later.' 
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for development
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task_scheduler', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Connection events
mongoose.connection.on('connected', () => {
  console.log('📊 MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/schedules', scheduleRoutes);
// app.use('/api/daily-schedules', dailyScheduleRoutes);
app.use('/api/email', emailRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: ['auth', 'staff', 'tasks', 'schedules', 'daily-schedules', 'email']
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
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(statusCode).json({
    success: false,
    message: message,
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
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  console.log(`📧 Email service: /api/email`);
  console.log(`📅 Weekly Schedule service: /api/schedules`);
  console.log(`📅 Daily Schedule service: /api/daily-schedules`);
  console.log(`✅ Task service: /api/tasks`);
  console.log(`👤 Auth service: /api/auth`);
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