const Schedule = require('../models/Schedule.model');
const Task = require('../models/Task.model');
const Staff = require('../models/Staff.model');
const { startOfWeek, endOfWeek } = require('date-fns');

class ScheduleService {
  constructor() {
    this.stats = {
      schedulesCreated: 0,
      conflictsPrevented: 0
    };
  }

  // 🚀 CREATE SCHEDULE - FIXED VERSION
  async createSchedule(scheduleData) {
    try {
      console.log('📨 Creating schedule:', scheduleData);
      
      // Validate schedule type
      if (!['daily', 'weekly'].includes(scheduleData.scheduleType)) {
        throw new Error('Schedule type must be either "daily" or "weekly"');
      }

      // Validate task exists
      const task = await Task.findById(scheduleData.taskId);
      if (!task) {
        throw new Error(`Task with ID ${scheduleData.taskId} not found`);
      }

      // Get task category
      const taskCategory = task.category || 'general';
      
      // Validate all staff members exist
      const assignments = [];
      const staffIds = scheduleData.staffIds || [];
      
      for (const staffId of staffIds) {
        const staff = await Staff.findById(staffId);
        if (!staff) {
          throw new Error(`Staff member with ID ${staffId} not found`);
        }

        // For daily schedules: Check if staff is available on that date
        if (scheduleData.scheduleType === 'daily') {
          const scheduleDate = new Date(scheduleData.scheduledDate);
          const dayStart = new Date(scheduleDate);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(scheduleDate);
          dayEnd.setHours(23, 59, 59, 999);
          
          const existingDailyTask = await Schedule.findOne({
            'assignments.staffId': staffId,
            scheduleType: 'daily',
            scheduledDate: {
              $gte: dayStart,
              $lte: dayEnd
            },
            status: { $in: ['scheduled', 'in-progress'] }
          });

          if (existingDailyTask) {
            throw new Error(`Staff ${staff.firstName} ${staff.lastName} already has a task scheduled for ${scheduleDate.toDateString()}`);
          }
        }
        
        // For weekly schedules: Check weekly restrictions
        if (scheduleData.scheduleType === 'weekly') {
          const scheduleDate = new Date(scheduleData.scheduledDate);
          const weekStart = startOfWeek(scheduleDate, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(scheduleDate, { weekStartsOn: 1 });
          
          const existingWeeklyTask = await Schedule.findOne({
            'assignments.staffId': staffId,
            scheduleType: 'weekly',
            scheduledDate: {
              $gte: weekStart,
              $lte: weekEnd
            },
            status: { $in: ['scheduled', 'in-progress'] }
          });

          if (existingWeeklyTask) {
            throw new Error(`Staff ${staff.firstName} ${staff.lastName} already has a weekly task scheduled for this week`);
          }
        }

        assignments.push({
          staffId: staff._id,
          staffName: `${staff.firstName} ${staff.lastName}`,
          email: staff.email,
          status: 'pending',
          notificationSent: false,
          notificationSentAt: null,
          emailStatus: 'pending'
        });
      }

      // Generate schedule ID
      const scheduleId = this.generateScheduleId(scheduleData.scheduleType);

      // Calculate end date properly
      let endDate;
      if (scheduleData.endDate) {
        endDate = new Date(scheduleData.endDate);
      } else {
        // For daily: add estimated hours
        // For weekly: add 7 days
        if (scheduleData.scheduleType === 'daily') {
          const startDate = new Date(scheduleData.scheduledDate);
          endDate = new Date(startDate.getTime() + scheduleData.estimatedHours * 60 * 60 * 1000);
        } else {
          const startDate = new Date(scheduleData.scheduledDate);
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 7);
        }
      }

      // Create the schedule
      const newSchedule = new Schedule({
        scheduleId,
        scheduleType: scheduleData.scheduleType,
        taskId: scheduleData.taskId,
        taskTitle: task.title,
        taskCategory: taskCategory,
        taskDescription: scheduleData.taskDescription || task.description,
        assignments: assignments,
        priority: scheduleData.priority || 'medium',
        estimatedHours: scheduleData.estimatedHours,
        scheduledDate: scheduleData.scheduledDate,
        endDate: endDate,
        recurrence: scheduleData.recurrence || 'once',
        department: scheduleData.department || task.department || 'General',
        sendEmail: scheduleData.sendEmail !== false,
        notes: scheduleData.notes,
        status: 'scheduled',
        location: scheduleData.location || 'Office',
        enableRotation: scheduleData.enableRotation || false,
        createdBy: scheduleData.createdBy,
        emailSent: false,
        emailStatus: 'pending'
      });

      await newSchedule.save();
      this.stats.schedulesCreated++;

      // Send email notifications if enabled
      let notificationResults = [];
      if (scheduleData.sendEmail !== false) {
        try {
          notificationResults = await this.sendScheduleNotifications(newSchedule);
          console.log('📧 Email notification results:', notificationResults);
        } catch (emailError) {
          console.error('❌ Email sending failed:', emailError);
          notificationResults = [{
            success: false,
            error: emailError.message
          }];
        }
      } else {
        console.log('📧 Email notifications disabled by user');
      }

      return {
        success: true,
        message: `${scheduleData.scheduleType === 'daily' ? 'Daily' : 'Weekly'} schedule created successfully`,
        data: {
          schedule: newSchedule,
          notifications: notificationResults
        }
      };

    } catch (error) {
      console.error('❌ Error creating schedule:', error.message);
      throw error;
    }
  }

  // 📧 SEND SCHEDULE NOTIFICATIONS
  async sendScheduleNotifications(schedule) {
    console.log(`📧 Starting email notifications for ${schedule.scheduleType} schedule: ${schedule.scheduleId}`);
    console.log(`📧 Number of recipients: ${schedule.assignments.length}`);

    const notificationResults = [];
    let successfulCount = 0;

    for (const assignment of schedule.assignments) {
      try {
        // Simulate email sending (replace with actual email service)
        console.log(`📧 Sending email to: ${assignment.email}`);
        
        // Update assignment status
        assignment.notificationSent = true;
        assignment.notificationSentAt = new Date();
        assignment.emailStatus = 'sent';
        
        successfulCount++;
        
        notificationResults.push({
          success: true,
          staffName: assignment.staffName,
          email: assignment.email,
          sentAt: new Date()
        });
        
        // Simulate slight delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${assignment.email}:`, emailError);
        
        assignment.notificationSent = false;
        assignment.emailStatus = 'failed';
        assignment.emailError = emailError.message;
        
        notificationResults.push({
          success: false,
          staffName: assignment.staffName,
          email: assignment.email,
          error: emailError.message
        });
      }
    }

    // Update schedule email status
    const totalCount = schedule.assignments.length;
    
    if (successfulCount > 0) {
      schedule.emailSent = true;
      schedule.emailStatus = successfulCount === totalCount ? 'all_sent' : 'partial_sent';
      schedule.lastNotificationSent = new Date();
    } else {
      schedule.emailSent = false;
      schedule.emailStatus = 'failed';
    }

    // Save updated schedule
    await schedule.save();
    
    console.log(`📧 Email notification summary:`);
    console.log(`   Total: ${totalCount}`);
    console.log(`   Successful: ${successfulCount}`);
    console.log(`   Failed: ${totalCount - successfulCount}`);

    return notificationResults;
  }

  // 🔧 TEST EMAIL SERVICE
  async testEmailService() {
    try {
      console.log('🔧 Testing email service...');
      
      return {
        success: true,
        message: 'Email service test successful',
        timestamp: new Date().toISOString(),
        details: {
          status: 'Ready',
          testEmail: 'test@example.com',
          result: 'Simulated email service is working'
        }
      };
    } catch (error) {
      console.error('❌ Error testing email service:', error);
      
      return {
        success: false,
        message: 'Failed to test email service',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 🔧 HELPER METHODS
  generateScheduleId(scheduleType) {
    const prefix = scheduleType === 'weekly' ? 'WK' : 'DY';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}${random}`;
  }

  getDateFromWeekNumber(weekNumber, year) {
    const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    const dayOfWeek = simple.getDay();
    const weekStart = simple;
    if (dayOfWeek <= 4) {
      weekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      weekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return weekStart;
  }

  // 📋 GET ALL SCHEDULES
  async getAllSchedules(filters = {}) {
    try {
      let query = {};
      
      // Apply filters
      if (filters.scheduleType && filters.scheduleType !== 'all') {
        query.scheduleType = filters.scheduleType;
      }
      
      if (filters.status && filters.status !== 'all') {
        query.status = filters.status;
      }
      
      if (filters.startDate && filters.endDate) {
        query.scheduledDate = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }
      
      if (filters.date) {
        const date = new Date(filters.date);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        query.scheduledDate = {
          $gte: date,
          $lt: nextDay
        };
      }
      
      if (filters.staffId) {
        query['assignments.staffId'] = filters.staffId;
      }
      
      if (filters.priority && filters.priority !== 'all') {
        query.priority = filters.priority;
      }
      
      if (filters.department) {
        query.department = filters.department;
      }
      
      if (filters.weekNumber) {
        query.weekNumber = parseInt(filters.weekNumber);
      }
      
      // Search functionality
      if (filters.search) {
        query.$or = [
          { taskTitle: { $regex: filters.search, $options: 'i' } },
          { scheduleId: { $regex: filters.search, $options: 'i' } },
          { 'assignments.staffName': { $regex: filters.search, $options: 'i' } }
        ];
      }

      const schedules = await Schedule.find(query)
        .populate('taskId', 'title category')
        .populate('assignments.staffId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .sort({ scheduledDate: -1, createdAt: -1 });

      return {
        success: true,
        count: schedules.length,
        data: schedules
      };
    } catch (error) {
      console.error('❌ Error fetching schedules:', error);
      throw error;
    }
  }

  // 📅 GET UPCOMING SCHEDULES
  async getUpcomingSchedules(days = 7, scheduleType = 'all') {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      let query = {
        scheduledDate: {
          $gte: startDate,
          $lte: endDate
        },
        status: 'scheduled'
      };

      if (scheduleType !== 'all') {
        query.scheduleType = scheduleType;
      }

      const schedules = await Schedule.find(query)
        .populate('taskId', 'title')
        .populate('assignments.staffId', 'firstName lastName')
        .sort({ scheduledDate: 1 });

      return {
        success: true,
        count: schedules.length,
        data: schedules
      };
    } catch (error) {
      console.error('❌ Error fetching upcoming schedules:', error);
      throw error;
    }
  }

  // 🔍 GET SCHEDULE BY ID
  async getScheduleById(id) {
    try {
      const schedule = await Schedule.findById(id)
        .populate('taskId', 'title category description')
        .populate('assignments.staffId', 'firstName lastName email department')
        .populate('createdBy', 'firstName lastName');

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      return {
        success: true,
        data: schedule
      };
    } catch (error) {
      console.error('❌ Error fetching schedule:', error);
      throw error;
    }
  }

  // 🔄 UPDATE SCHEDULE
  async updateSchedule(id, updateData) {
    try {
      const schedule = await Schedule.findById(id);
      
      if (!schedule) {
        throw new Error('Schedule not found');
      }

      // Update only allowed fields
      const allowedUpdates = ['priority', 'estimatedHours', 'scheduledDate', 'endDate', 'status', 'department', 'notes', 'location'];
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          schedule[field] = updateData[field];
        }
      });

      await schedule.save();

      return {
        success: true,
        message: 'Schedule updated successfully',
        data: schedule
      };
    } catch (error) {
      console.error('❌ Error updating schedule:', error);
      throw error;
    }
  }

  // ❌ DELETE SCHEDULE
  async deleteSchedule(id) {
    try {
      const schedule = await Schedule.findById(id);
      
      if (!schedule) {
        throw new Error('Schedule not found');
      }

      await schedule.deleteOne();

      return {
        success: true,
        message: 'Schedule deleted successfully'
      };
    } catch (error) {
      console.error('❌ Error deleting schedule:', error);
      throw error;
    }
  }

  // 👥 GET STAFF WORKLOAD
  async getStaffWorkload(staffId, startDate, endDate) {
    try {
      const staff = await Staff.findById(staffId);
      if (!staff) {
        throw new Error('Staff not found');
      }

      const schedules = await Schedule.find({
        'assignments.staffId': staffId,
        scheduledDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }).sort({ scheduledDate: 1 });

      const totalHours = schedules.reduce((sum, schedule) => sum + schedule.estimatedHours, 0);
      const completedSchedules = schedules.filter(s => s.status === 'completed').length;

      return {
        success: true,
        data: {
          staff: {
            id: staff._id,
            name: `${staff.firstName} ${staff.lastName}`,
            department: staff.department
          },
          workload: {
            totalSchedules: schedules.length,
            totalHours,
            completedSchedules,
            pendingSchedules: schedules.length - completedSchedules,
            schedules: schedules.map(s => ({
              id: s._id,
              scheduleId: s.scheduleId,
              taskTitle: s.taskTitle,
              scheduledDate: s.scheduledDate,
              estimatedHours: s.estimatedHours,
              status: s.status
            }))
          }
        }
      };
    } catch (error) {
      console.error('❌ Error getting staff workload:', error);
      throw error;
    }
  }

  // 📅 CHECK DATE AVAILABILITY
  async checkDateAvailability(date, department, scheduleType) {
    try {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      let query = {
        scheduledDate: {
          $gte: targetDate,
          $lt: nextDay
        },
        status: { $in: ['scheduled', 'in-progress'] }
      };

      if (department) {
        query.department = department;
      }

      if (scheduleType) {
        query.scheduleType = scheduleType;
      }

      const schedules = await Schedule.find(query)
        .populate('assignments.staffId', 'firstName lastName');

      const staffSet = new Set();
      schedules.forEach(schedule => {
        schedule.assignments.forEach(assignment => {
          staffSet.add(assignment.staffId.toString());
        });
      });

      const availableStaff = await Staff.find({
        _id: { $nin: Array.from(staffSet) },
        ...(department && { department })
      });

      return {
        success: true,
        data: {
          date,
          scheduledTasks: schedules.length,
          scheduledStaff: staffSet.size,
          availableStaff: availableStaff.map(staff => ({
            id: staff._id,
            name: `${staff.firstName} ${staff.lastName}`,
            department: staff.department
          }))
        }
      };
    } catch (error) {
      console.error('❌ Error checking date availability:', error);
      throw error;
    }
  }

  // 📈 GENERATE REPORT
  async generateReport(startDate, endDate, department, scheduleType) {
    try {
      let query = {
        scheduledDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      if (department) {
        query.department = department;
      }

      if (scheduleType) {
        query.scheduleType = scheduleType;
      }

      const schedules = await Schedule.find(query)
        .populate('taskId', 'title category')
        .populate('assignments.staffId', 'firstName lastName department');

      // Calculate statistics
      const stats = {
        totalSchedules: schedules.length,
        totalHours: schedules.reduce((sum, s) => sum + s.estimatedHours, 0),
        byStatus: {},
        byPriority: {},
        byScheduleType: {},
        byDepartment: {}
      };

      schedules.forEach(schedule => {
        // Count by status
        stats.byStatus[schedule.status] = (stats.byStatus[schedule.status] || 0) + 1;
        
        // Count by priority
        stats.byPriority[schedule.priority] = (stats.byPriority[schedule.priority] || 0) + 1;
        
        // Count by schedule type
        stats.byScheduleType[schedule.scheduleType] = (stats.byScheduleType[schedule.scheduleType] || 0) + 1;
        
        // Count by department
        stats.byDepartment[schedule.department] = (stats.byDepartment[schedule.department] || 0) + 1;
      });

      return {
        success: true,
        data: {
          period: {
            startDate,
            endDate
          },
          stats,
          schedules: schedules.map(s => ({
            id: s._id,
            scheduleId: s.scheduleId,
            taskTitle: s.taskTitle,
            scheduleType: s.scheduleType,
            scheduledDate: s.scheduledDate,
            estimatedHours: s.estimatedHours,
            priority: s.priority,
            status: s.status,
            department: s.department,
            staffCount: s.assignments.length
          }))
        }
      };
    } catch (error) {
      console.error('❌ Error generating report:', error);
      throw error;
    }
  }

  // 📊 GET SCHEDULE STATISTICS
  async getScheduleStatistics() {
    try {
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      
      // Get counts
      const [totalSchedules, upcomingSchedules, inProgressSchedules, thisWeekSchedules] = await Promise.all([
        Schedule.countDocuments(),
        Schedule.countDocuments({
          status: 'scheduled',
          scheduledDate: { $gt: today }
        }),
        Schedule.countDocuments({ status: 'in-progress' }),
        Schedule.countDocuments({
          scheduledDate: {
            $gte: weekStart,
            $lte: weekEnd
          }
        })
      ]);

      // Get recent schedules
      const recentSchedules = await Schedule.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('taskId', 'title')
        .populate('assignments.staffId', 'firstName lastName');

      return {
        success: true,
        data: {
          counts: {
            total: totalSchedules,
            upcoming: upcomingSchedules,
            inProgress: inProgressSchedules,
            thisWeek: thisWeekSchedules
          },
          recentSchedules: recentSchedules.map(s => ({
            id: s._id,
            scheduleId: s.scheduleId,
            taskTitle: s.taskTitle,
            scheduleType: s.scheduleType,
            scheduledDate: s.scheduledDate,
            staffCount: s.assignments.length
          }))
        }
      };
    } catch (error) {
      console.error('❌ Error getting statistics:', error);
      throw error;
    }
  }

  // 🎯 GET RECOMMENDED TIMES
  async getRecommendedTimes(date, duration, department, scheduleType = 'daily') {
    try {
      const targetDate = new Date(date);
      const hours = parseFloat(duration);
      
      // Find busy times for the day
      const schedules = await Schedule.find({
        scheduledDate: {
          $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          $lt: new Date(targetDate.setHours(23, 59, 59, 999))
        },
        ...(department && { department }),
        scheduleType
      });

      // Calculate busy hours (9 AM to 5 PM)
      const busyHours = new Set();
      schedules.forEach(schedule => {
        const scheduleHour = schedule.scheduledDate.getHours();
        for (let i = 0; i < schedule.estimatedHours; i++) {
          busyHours.add(scheduleHour + i);
        }
      });

      // Generate recommended times (avoiding busy hours)
      const recommendations = [];
      for (let hour = 9; hour <= 17 - hours; hour++) {
        let isAvailable = true;
        for (let i = 0; i < hours; i++) {
          if (busyHours.has(hour + i)) {
            isAvailable = false;
            break;
          }
        }
        
        if (isAvailable) {
          recommendations.push({
            time: `${hour.toString().padStart(2, '0')}:00`,
            display: `${hour}:00 - ${hour + hours}:00`,
            available: true
          });
        }
      }

      // Add some default recommendations if none found
      if (recommendations.length === 0) {
        recommendations.push(
          { time: '09:00', display: '9:00 AM - 11:00 AM', available: true },
          { time: '13:00', display: '1:00 PM - 3:00 PM', available: true },
          { time: '15:00', display: '3:00 PM - 5:00 PM', available: true }
        );
      }

      return {
        success: true,
        data: {
          date,
          duration,
          recommendations: recommendations.slice(0, 3)
        }
      };
    } catch (error) {
      console.error('❌ Error getting recommended times:', error);
      throw error;
    }
  }

  // 👥 GET STAFF WEEKLY SCHEDULE
  async getStaffWeeklySchedule(staffId, weekNumber, year) {
    try {
      const staff = await Staff.findById(staffId);
      if (!staff) {
        throw new Error('Staff not found');
      }

      // Calculate date range for the week
      const weekStart = this.getDateFromWeekNumber(weekNumber, year);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weeklySchedule = await Schedule.find({
        'assignments.staffId': staffId,
        scheduledDate: {
          $gte: weekStart,
          $lte: weekEnd
        },
        status: { $in: ['scheduled', 'in-progress', 'completed'] }
      })
      .populate('taskId', 'title category')
      .sort({ scheduledDate: 1 });

      return {
        success: true,
        data: {
          staffName: `${staff.firstName} ${staff.lastName}`,
          weekNumber,
          year,
          schedules: weeklySchedule.map(schedule => ({
            id: schedule._id,
            scheduleId: schedule.scheduleId,
            taskTitle: schedule.taskTitle,
            taskCategory: schedule.taskCategory,
            scheduleType: schedule.scheduleType,
            scheduledDate: schedule.scheduledDate,
            estimatedHours: schedule.estimatedHours,
            priority: schedule.priority,
            status: schedule.status
          })),
          weeklySummary: {
            totalTasks: weeklySchedule.length,
            totalHours: weeklySchedule.reduce((sum, s) => sum + s.estimatedHours, 0),
            dailyTasks: weeklySchedule.filter(s => s.scheduleType === 'daily').length,
            weeklyTasks: weeklySchedule.filter(s => s.scheduleType === 'weekly').length
          }
        }
      };
    } catch (error) {
      console.error('❌ Error getting staff weekly schedule:', error);
      throw error;
    }
  }

  // 🔄 CHECK CONSECUTIVE WEEK RESTRICTION
  async checkConsecutiveWeekRestriction(staffId, taskCategory, date) {
    try {
      const scheduledDate = new Date(date);
      const oneWeekAgo = new Date(scheduledDate);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const previousWeekTask = await Schedule.findOne({
        'assignments.staffId': staffId,
        taskCategory: taskCategory,
        scheduledDate: {
          $gte: oneWeekAgo,
          $lt: scheduledDate
        },
        status: { $in: ['completed'] }
      }).populate('taskId', 'title category');

      return {
        success: true,
        available: !previousWeekTask,
        reason: previousWeekTask ? `Worked on similar "${previousWeekTask.taskTitle}" task last week` : null,
        previousTask: previousWeekTask ? {
          title: previousWeekTask.taskTitle,
          category: previousWeekTask.taskCategory,
          scheduleId: previousWeekTask.scheduleId
        } : null
      };
    } catch (error) {
      console.error('❌ Error checking consecutive week:', error);
      throw error;
    }
  }
}

module.exports = new ScheduleService();