const express = require('express');
const router = express.Router();
const dailyScheduleController = require('../controllers/dailySchedule.controller');
const { 
  validateDailyScheduleData, 
  validateDailyScheduleUpdate,
  validateIdParam,
  validateStaffIdParam,
  validateDailyScheduleFilters,
  validateAssignmentUpdate
} = require('../middleware/dailySchedule.middleware');

// Apply rate limiting middleware
const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Apply to all routes
router.use(apiLimiter);

// Health check
router.get('/health', dailyScheduleController.healthCheck);

// Test service
router.get('/test', dailyScheduleController.testService);

// Create daily schedule
router.post('/', validateDailyScheduleData, dailyScheduleController.createDailySchedule);

// Get all daily schedules with filters
router.get('/', validateDailyScheduleFilters, dailyScheduleController.getDailySchedules);

// Get today's schedules
router.get('/today', dailyScheduleController.getTodaySchedules);

// Get schedules by date range
router.get('/range', dailyScheduleController.getSchedulesByDateRange);

// Get daily schedule by ID
router.get('/:id', validateIdParam, dailyScheduleController.getDailyScheduleById);

// Update daily schedule
router.put('/:id', validateIdParam, validateDailyScheduleUpdate, dailyScheduleController.updateDailySchedule);

// Update assignment status
router.patch('/:scheduleId/assignments/:staffId', validateAssignmentUpdate, dailyScheduleController.updateAssignmentStatus);

// Delete daily schedule
router.delete('/:id', validateIdParam, dailyScheduleController.deleteDailySchedule);

// Get staff daily workload
router.get('/staff/:staffId/workload', validateStaffIdParam, dailyScheduleController.getStaffDailyWorkload);

// Get daily statistics
router.get('/stats', dailyScheduleController.getDailyStatistics);

// Check staff availability
router.get('/availability/:staffId', validateStaffIdParam, dailyScheduleController.checkStaffAvailability);

module.exports = router;