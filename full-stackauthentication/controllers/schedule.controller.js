const scheduleService = require('../services/schedule.service');

class ScheduleController {
  // 🚀 CREATE SCHEDULE
  async createSchedule(req, res) {
    try {
      console.log('📨 Received schedule request:', req.body);
      
      const scheduleData = {
        ...req.body,
        createdBy: req.user?._id
      };

      const result = await scheduleService.createSchedule(scheduleData);
      
      res.status(201).json(result);
    } catch (error) {
      console.error('❌ Error creating schedule:', error);
      
      let statusCode = 500;
      let userMessage = 'Failed to create schedule. Please try again.';
      let errorCode = 'INTERNAL_SERVER_ERROR';
      
      if (error.message.includes('not found')) {
        statusCode = 404;
        userMessage = error.message;
        errorCode = 'RESOURCE_NOT_FOUND';
      } else if (error.message.includes('already has')) {
        statusCode = 409;
        userMessage = error.message;
        errorCode = 'SCHEDULE_CONFLICT';
      } else if (error.message.includes('must be')) {
        statusCode = 400;
        userMessage = error.message;
        errorCode = 'VALIDATION_ERROR';
      } else if (error.message.includes('Email server connection failed')) {
        statusCode = 503;
        userMessage = 'Email service is unavailable. Please check your email configuration.';
        errorCode = 'EMAIL_SERVICE_UNAVAILABLE';
      }
      
      res.status(statusCode).json({
        success: false,
        message: userMessage,
        code: errorCode,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 🧪 TEST EMAIL SERVICE - NEW METHOD
  async testEmailService(req, res) {
    try {
      console.log('🔧 Testing email service...');
      
      const result = await scheduleService.testEmailService();
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('❌ Error testing email service:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test email service',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 📋 GET ALL SCHEDULES
  async getAllSchedules(req, res) {
    try {
      const filters = {
        scheduleType: req.query.scheduleType,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        date: req.query.date,
        staffId: req.query.staffId,
        priority: req.query.priority,
        department: req.query.department,
        weekNumber: req.query.weekNumber,
        search: req.query.search
      };
      
      const result = await scheduleService.getAllSchedules(filters);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error fetching schedules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch schedules',
        code: 'FETCH_SCHEDULES_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 📅 GET UPCOMING SCHEDULES
  async getUpcomingSchedules(req, res) {
    try {
      const days = parseInt(req.query.days) || 7;
      const scheduleType = req.query.scheduleType || 'all';
      const result = await scheduleService.getUpcomingSchedules(days, scheduleType);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error fetching upcoming schedules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch upcoming schedules',
        code: 'FETCH_UPCOMING_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 🔍 GET SCHEDULE BY ID
  async getScheduleById(req, res) {
    try {
      const { id } = req.params;
      const result = await scheduleService.getScheduleById(id);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Schedule not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'SCHEDULE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to fetch schedule',
        code: 'FETCH_SCHEDULE_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 🔄 UPDATE SCHEDULE
  async updateSchedule(req, res) {
    try {
      const { id } = req.params;
      const result = await scheduleService.updateSchedule(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Schedule not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'SCHEDULE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to update schedule',
        code: 'UPDATE_SCHEDULE_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ❌ DELETE SCHEDULE
  async deleteSchedule(req, res) {
    try {
      const { id } = req.params;
      const result = await scheduleService.deleteSchedule(id);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Schedule not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'SCHEDULE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to delete schedule',
        code: 'DELETE_SCHEDULE_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 👥 GET STAFF WORKLOAD
  async getStaffWorkload(req, res) {
    try {
      const { staffId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
          code: 'MISSING_DATE_PARAMS',
          timestamp: new Date().toISOString()
        });
      }
      
      const result = await scheduleService.getStaffWorkload(staffId, startDate, endDate);
      res.status(200).json(result);
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
        message: 'Failed to get staff workload',
        code: 'FETCH_WORKLOAD_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 📅 CHECK DATE AVAILABILITY
  async checkDateAvailability(req, res) {
    try {
      const { date } = req.params;
      const { department, scheduleType } = req.query;
      
      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Date is required',
          code: 'MISSING_DATE',
          timestamp: new Date().toISOString()
        });
      }
      
      const result = await scheduleService.checkDateAvailability(date, department, scheduleType);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error checking date availability:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check date availability',
        code: 'CHECK_AVAILABILITY_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 📈 GENERATE REPORT
  async generateReport(req, res) {
    try {
      const { startDate, endDate, department, scheduleType } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
          code: 'MISSING_DATE_PARAMS',
          timestamp: new Date().toISOString()
        });
      }
      
      const result = await scheduleService.generateReport(startDate, endDate, department, scheduleType);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error generating report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate report',
        code: 'GENERATE_REPORT_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 📊 GET SCHEDULE STATISTICS
  async getScheduleStatistics(req, res) {
    try {
      const result = await scheduleService.getScheduleStatistics();
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error getting statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get schedule statistics',
        code: 'FETCH_STATISTICS_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 🎯 GET RECOMMENDED TIMES
  async getRecommendedTimes(req, res) {
    try {
      const { date, duration, department, scheduleType = 'daily' } = req.query;
      
      if (!date || !duration) {
        return res.status(400).json({
          success: false,
          message: 'Date and duration are required',
          code: 'MISSING_PARAMS',
          timestamp: new Date().toISOString()
        });
      }
      
      const result = await scheduleService.getRecommendedTimes(date, duration, department, scheduleType);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error getting recommended times:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recommended times',
        code: 'FETCH_RECOMMENDATIONS_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 📦 BULK SCHEDULE CREATION
  async createBulkSchedules(req, res) {
    try {
      const { schedules } = req.body;
      
      if (!schedules || !Array.isArray(schedules)) {
        return res.status(400).json({
          success: false,
          message: 'Schedules array is required',
          code: 'INVALID_REQUEST',
          timestamp: new Date().toISOString()
        });
      }
      
      const results = await Promise.allSettled(
        schedules.map(schedule => 
          scheduleService.createSchedule({
            ...schedule,
            createdBy: req.user?._id
          })
        )
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failed = results.filter(r => r.status === 'rejected').map((r, index) => ({
        index,
        error: r.reason.message,
        schedule: schedules[index]
      }));
      
      res.status(200).json({
        success: true,
        message: `Processed ${schedules.length} schedules`,
        summary: {
          total: schedules.length,
          successful: successful.length,
          failed: failed.length
        },
        successful,
        failed
      });
    } catch (error) {
      console.error('❌ Error creating bulk schedules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create bulk schedules',
        code: 'BULK_CREATE_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 🔄 UPDATE ASSIGNMENT STATUS
  async updateAssignmentStatus(req, res) {
    try {
      const { scheduleId, staffId } = req.params;
      const { status, notes, hoursWorked } = req.body;
      
      // Use scheduleService to handle this
      const result = await scheduleService.updateAssignmentStatus(scheduleId, staffId, {
        status,
        notes,
        hoursWorked
      });
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error updating assignment status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update assignment status',
        code: 'UPDATE_ASSIGNMENT_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 👥 GET STAFF SCHEDULES
  async getStaffSchedules(req, res) {
    try {
      const { staffId } = req.params;
      const filters = {
        staffId,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        scheduleType: req.query.scheduleType
      };
      
      const result = await scheduleService.getAllSchedules(filters);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error getting staff schedules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get staff schedules',
        code: 'FETCH_STAFF_SCHEDULES_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 📅 GET CALENDAR VIEW
  async getCalendarView(req, res) {
    try {
      const { startDate, endDate, department, scheduleType } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
          code: 'MISSING_DATE_PARAMS',
          timestamp: new Date().toISOString()
        });
      }
      
      const filters = {
        startDate,
        endDate,
        department,
        scheduleType
      };
      
      const result = await scheduleService.getAllSchedules(filters);
      
      // Transform to calendar format
      const calendarData = result.data.map(schedule => ({
        id: schedule._id,
        title: `${schedule.scheduleType === 'weekly' ? '🔄 ' : '📅 '}${schedule.taskTitle}`,
        start: schedule.scheduledDate,
        end: schedule.endDate || new Date(new Date(schedule.scheduledDate).getTime() + schedule.estimatedHours * 60 * 60 * 1000),
        priority: schedule.priority,
        staffCount: schedule.assignments.length,
        department: schedule.department,
        scheduleType: schedule.scheduleType,
        color: schedule.scheduleType === 'weekly' ? '#4F46E5' : '#10B981',
        extendedProps: {
          scheduleId: schedule.scheduleId,
          estimatedHours: schedule.estimatedHours
        }
      }));
      
      res.status(200).json({
        success: true,
        data: calendarData,
        summary: {
          daily: calendarData.filter(item => item.scheduleType === 'daily').length,
          weekly: calendarData.filter(item => item.scheduleType === 'weekly').length,
          total: calendarData.length
        }
      });
    } catch (error) {
      console.error('❌ Error getting calendar view:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get calendar view',
        code: 'FETCH_CALENDAR_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 🔍 SEARCH SCHEDULES
  async searchSchedules(req, res) {
    try {
      const { q, scheduleType } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
          code: 'MISSING_SEARCH_QUERY',
          timestamp: new Date().toISOString()
        });
      }
      
      const filters = { 
        search: q,
        scheduleType
      };
      
      const result = await scheduleService.getAllSchedules(filters);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error searching schedules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search schedules',
        code: 'SEARCH_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 📅 GET STAFF WEEKLY SCHEDULE - NEW ENDPOINT
  async getStaffWeeklySchedule(req, res) {
    try {
      const { staffId, weekNumber, year } = req.params;
      
      const result = await scheduleService.getStaffWeeklySchedule(
        staffId, 
        parseInt(weekNumber), 
        parseInt(year)
      );
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error getting staff weekly schedule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get staff weekly schedule',
        code: 'FETCH_WEEKLY_SCHEDULE_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 🔄 CHECK CONSECUTIVE WEEK RESTRICTION - NEW ENDPOINT
  async checkConsecutiveWeekRestriction(req, res) {
    try {
      const { staffId, taskCategory, date } = req.params;
      
      const result = await scheduleService.checkConsecutiveWeekRestriction(
        staffId,
        taskCategory,
        date
      );
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error checking consecutive week:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check consecutive week restriction',
        code: 'CHECK_CONSECUTIVE_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 🩺 HEALTH CHECK
  async healthCheck(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: 'Schedule API is running 🚀',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: [
          'POST /api/schedules - Create schedule',
          'GET /api/schedules - Get all schedules',
          'GET /api/schedules/upcoming - Get upcoming schedules',
          'GET /api/schedules/:id - Get schedule by ID',
          'PUT /api/schedules/:id - Update schedule',
          'DELETE /api/schedules/:id - Delete schedule',
          'GET /api/schedules/staff/:staffId/workload - Get staff workload',
          'GET /api/schedules/availability/:date - Check date availability',
          'GET /api/schedules/test-email - Test email service',
          'GET /api/schedules/staff/:staffId/weekly/:weekNumber/:year - Get staff weekly schedule',
          'GET /api/schedules/check/consecutive/:staffId/:taskCategory/:date - Check consecutive week restriction'
        ]
      });
    } catch (error) {
      res.status(200).json({
        success: false,
        message: 'Schedule API has issues ⚠️',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new ScheduleController();