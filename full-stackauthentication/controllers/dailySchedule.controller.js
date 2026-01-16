const dailyScheduleService = require('../services/dailySchedule.service');

class DailyScheduleController {
  // 🚀 CREATE DAILY SCHEDULE
  async createDailySchedule(req, res) {
    try {
      console.log('📅 Received daily schedule request:', req.body);
      
      const scheduleData = {
        ...req.body,
        createdBy: req.user?._id || req.body.createdBy
      };

      const result = await dailyScheduleService.createDailySchedule(scheduleData);
      
      res.status(201).json({
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error creating daily schedule:', error);
      
      let statusCode = 500;
      let userMessage = error.message || 'Failed to create daily schedule. Please try again.';
      let errorCode = 'INTERNAL_SERVER_ERROR';
      
      if (error.message.includes('not found')) {
        statusCode = 404;
        errorCode = 'RESOURCE_NOT_FOUND';
      } else if (error.message.includes('unavailable') || error.message.includes('already')) {
        statusCode = 409;
        errorCode = 'STAFF_UNAVAILABLE';
      } else if (error.message.includes('required') || error.message.includes('invalid')) {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
      }
      
      res.status(statusCode).json({
        success: false,
        message: userMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
  }

  // 📋 GET ALL DAILY SCHEDULES
  async getDailySchedules(req, res) {
    try {
      const filters = {
        date: req.query.date,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        staffId: req.query.staffId,
        status: req.query.status,
        priority: req.query.priority,
        department: req.query.department,
        taskCategory: req.query.taskCategory,
        timeSlot: req.query.timeSlot,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit
      };
      
      const result = await dailyScheduleService.getDailySchedules(filters);
      res.status(200).json({
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error fetching daily schedules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch daily schedules',
        code: 'FETCH_DAILY_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 📅 GET TODAY'S SCHEDULES
  async getTodaySchedules(req, res) {
    try {
      const staffId = req.query.staffId;
      const result = await dailyScheduleService.getTodaySchedules(staffId);
      
      res.status(200).json({
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error fetching today\'s schedules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch today\'s schedules',
        code: 'FETCH_TODAY_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 📅 GET SCHEDULES BY DATE RANGE
  async getSchedulesByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
          code: 'MISSING_DATE_PARAMS',
          timestamp: new Date().toISOString()
        });
      }
      
      const filters = {
        status: req.query.status,
        department: req.query.department,
        staffId: req.query.staffId
      };
      
      const result = await dailyScheduleService.getSchedulesByDateRange(startDate, endDate, filters);
      res.status(200).json({
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error fetching schedules by date range:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch schedules by date range',
        code: 'FETCH_DATE_RANGE_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 🔍 GET DAILY SCHEDULE BY ID
  async getDailyScheduleById(req, res) {
    try {
      const { id } = req.params;
      const result = await dailyScheduleService.getDailyScheduleById(id);
      
      res.status(200).json({
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message === 'Daily schedule not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'SCHEDULE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to fetch daily schedule',
        code: 'FETCH_SCHEDULE_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 🔄 UPDATE DAILY SCHEDULE
  async updateDailySchedule(req, res) {
    try {
      const { id } = req.params;
      const result = await dailyScheduleService.updateDailySchedule(id, req.body);
      
      res.status(200).json({
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message === 'Daily schedule not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'SCHEDULE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to update daily schedule',
        code: 'UPDATE_SCHEDULE_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 🔄 UPDATE ASSIGNMENT STATUS
  async updateAssignmentStatus(req, res) {
    try {
      const { scheduleId, staffId } = req.params;
      const result = await dailyScheduleService.updateAssignmentStatus(scheduleId, staffId, req.body);
      
      res.status(200).json({
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'NOT_FOUND',
          timestamp: new Date().toISOString()
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to update assignment status',
        code: 'UPDATE_ASSIGNMENT_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ❌ DELETE DAILY SCHEDULE
  async deleteDailySchedule(req, res) {
    try {
      const { id } = req.params;
      const result = await dailyScheduleService.deleteDailySchedule(id);
      
      res.status(200).json({
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message === 'Daily schedule not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'SCHEDULE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to delete daily schedule',
        code: 'DELETE_SCHEDULE_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 👥 GET STAFF DAILY WORKLOAD
  async getStaffDailyWorkload(req, res) {
    try {
      const { staffId } = req.params;
      const { date } = req.query;
      
      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Date parameter is required',
          code: 'MISSING_DATE',
          timestamp: new Date().toISOString()
        });
      }
      
      const result = await dailyScheduleService.getStaffDailyWorkload(staffId, date);
      res.status(200).json({
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message === 'Staff not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'STAFF_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to get staff daily workload',
        code: 'FETCH_WORKLOAD_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 📊 GET DAILY STATISTICS
  async getDailyStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
          code: 'MISSING_DATE_PARAMS',
          timestamp: new Date().toISOString()
        });
      }
      
      const result = await dailyScheduleService.getDailyStatistics(startDate, endDate);
      res.status(200).json({
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error getting daily statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get daily statistics',
        code: 'FETCH_STATISTICS_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 🎯 CHECK STAFF AVAILABILITY
  async checkStaffAvailability(req, res) {
    try {
      const { staffId } = req.params;
      const { date, timeSlot = 'full-day' } = req.query;
      
      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Date parameter is required',
          code: 'MISSING_DATE',
          timestamp: new Date().toISOString()
        });
      }
      
      const result = await dailyScheduleService.checkStaffAvailability(staffId, date, timeSlot);
      res.status(200).json({
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message === 'Staff not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'STAFF_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to check staff availability',
        code: 'CHECK_AVAILABILITY_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 🧪 TEST SERVICE
  async testService(req, res) {
    try {
      const result = await dailyScheduleService.testService();
      res.status(200).json({
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error testing daily schedule service:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test daily schedule service',
        code: 'TEST_SERVICE_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 🩺 HEALTH CHECK
  async healthCheck(req, res) {
    try {
      const serviceTest = await dailyScheduleService.testService();
      
      res.status(200).json({
        success: true,
        message: 'Daily Schedule API is running 🚀',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        serviceStatus: serviceTest.success ? 'healthy' : 'unhealthy',
        endpoints: [
          'POST   /api/daily-schedules - Create daily schedule',
          'GET    /api/daily-schedules - Get all daily schedules with filters',
          'GET    /api/daily-schedules/today - Get today\'s schedules',
          'GET    /api/daily-schedules/range - Get schedules by date range',
          'GET    /api/daily-schedules/:id - Get daily schedule by ID',
          'PUT    /api/daily-schedules/:id - Update daily schedule',
          'PATCH  /api/daily-schedules/:scheduleId/assignments/:staffId - Update assignment status',
          'DELETE /api/daily-schedules/:id - Delete daily schedule',
          'GET    /api/daily-schedules/staff/:staffId/workload - Get staff daily workload',
          'GET    /api/daily-schedules/stats - Get daily statistics',
          'GET    /api/daily-schedules/availability/:staffId - Check staff availability',
          'GET    /api/daily-schedules/test - Test service',
          'GET    /api/daily-schedules/health - Health check'
        ]
      });
    } catch (error) {
      res.status(200).json({
        success: false,
        message: 'Daily Schedule API has issues ⚠️',
        error: error.message,
        timestamp: new Date().toISOString(),
        status: 'degraded'
      });
    }
  }
}

module.exports = new DailyScheduleController();