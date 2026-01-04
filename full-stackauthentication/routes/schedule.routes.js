const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { 
  validateScheduleData, 
  validateScheduleUpdate,
  validateIdParam,
  validateStaffIdParam,
  validateScheduleFilters,
  validateBulkSchedules,
  validateAssignmentUpdate
} = require('../middleware/schedule.middleware');

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
router.get('/health', scheduleController.healthCheck);

// Test email service - NEW ENDPOINT
router.get('/test-email', scheduleController.testEmailService);

// Create new schedule
router.post('/', validateScheduleData, scheduleController.createSchedule);

// Get all schedules with filters
router.get('/', validateScheduleFilters, scheduleController.getAllSchedules);

// Get upcoming schedules
router.get('/upcoming', scheduleController.getUpcomingSchedules);

// Get schedule by ID
router.get('/:id', validateIdParam, scheduleController.getScheduleById);

// Update schedule
router.put('/:id', validateIdParam, validateScheduleUpdate, scheduleController.updateSchedule);

// Delete schedule
router.delete('/:id', validateIdParam, scheduleController.deleteSchedule);

// Get staff workload
router.get('/staff/:staffId/workload', validateStaffIdParam, scheduleController.getStaffWorkload);

// Check date availability
router.get('/availability/:date', scheduleController.checkDateAvailability);

// Generate report
router.get('/report', scheduleController.generateReport);

// 📊 NEW ENDPOINTS FOR FRONTEND

// Get schedule statistics
router.get('/stats/overview', scheduleController.getScheduleStatistics);

// Get recommended schedule times
router.get('/recommendations/times', scheduleController.getRecommendedTimes);

// Bulk schedule operations
router.post('/bulk/create', validateBulkSchedules, scheduleController.createBulkSchedules);

// Update assignment status
router.patch('/:scheduleId/assignments/:staffId/status', validateAssignmentUpdate, scheduleController.updateAssignmentStatus);

// Get schedules for specific staff
router.get('/staff/:staffId/schedules', validateStaffIdParam, scheduleController.getStaffSchedules);

// Get schedule calendar (for calendar view)
router.get('/calendar/view', scheduleController.getCalendarView);

// Search schedules
router.get('/search', scheduleController.searchSchedules);

router.get('/staff/:staffId/weekly/:weekNumber/:year', scheduleController.getStaffWeeklySchedule);

// Check consecutive week restriction
router.get('/check/consecutive/:staffId/:taskCategory/:date', scheduleController.checkConsecutiveWeekRestriction);

module.exports = router;