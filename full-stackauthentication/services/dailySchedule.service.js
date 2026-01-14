const DailySchedule = require('../models/DailySchedule.model');
const Task = require('../models/Task.model');
const Staff = require('../models/Staff.model');
const emailService = require('./email.service');
const { format, parseISO, isToday, isTomorrow, addDays, startOfDay, endOfDay } = require('date-fns');

class DailyScheduleService {
  constructor() {
    this.stats = {
      dailySchedulesCreated: 0,
      emailsSent: 0,
      conflictsAvoided: 0
    };
  }

  // 🚀 CREATE DAILY SCHEDULE (Updated for frontend compatibility)
  async createDailySchedule(scheduleData) {
    try {
      console.log('📅 Creating daily schedule:', scheduleData);
      
      // Check if it's a weekly schedule request from frontend
      if (scheduleData.scheduleType === 'weekly') {
        return await this.createWeeklyScheduleFromDaily(scheduleData);
      }

      // Validate required fields for daily schedule
      const requiredFields = ['taskId', 'staffIds'];
      for (const field of requiredFields) {
        if (!scheduleData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      if (!Array.isArray(scheduleData.staffIds) || scheduleData.staffIds.length === 0) {
        throw new Error('At least one staff member is required');
      }

      // Validate task exists
      const task = await Task.findById(scheduleData.taskId);
      if (!task) {
        throw new Error(`Task with ID ${scheduleData.taskId} not found`);
      }

      // Validate all staff members exist
      const assignments = [];
      const unavailableStaff = [];
      
      for (const staffId of scheduleData.staffIds) {
        const staff = await Staff.findById(staffId);
        if (!staff) {
          throw new Error(`Staff member with ID ${staffId} not found`);
        }

        // Check staff availability
        if (scheduleData.scheduledDate) {
          const availability = await DailySchedule.checkStaffAvailability(
            staffId, 
            scheduleData.scheduledDate,
            scheduleData.timeSlot || 'full-day'
          );
          
          if (!availability.isAvailable && scheduleData.checkAvailability !== false) {
            console.log(`⚠️ Staff ${staff.firstName} is not available on selected date/time`);
            unavailableStaff.push({
              staffId: staff._id,
              name: `${staff.firstName} ${staff.lastName}`,
              busyHours: availability.busyHours,
              existingSchedulesCount: availability.existingSchedulesCount
            });
            
            // Continue with other staff members if some are unavailable
            if (scheduleData.strictAvailability !== false) {
              continue;
            }
          }
        }

        assignments.push({
          staffId: staff._id,
          staffName: `${staff.firstName} ${staff.lastName}`,
          email: staff.email,
          status: 'pending',
          startTime: scheduleData.customStartTime || this.getDefaultStartTime(scheduleData.timeSlot),
          endTime: scheduleData.customEndTime || this.getDefaultEndTime(scheduleData.timeSlot),
          notificationSent: false,
          notificationSentAt: null,
          emailStatus: 'pending',
          department: staff.department || 'General'
        });
      }

      // If all staff are unavailable and strict mode is on, throw error
      if (assignments.length === 0 && unavailableStaff.length > 0 && scheduleData.strictAvailability !== false) {
        throw new Error(`All selected staff members are unavailable on the selected date/time. ${unavailableStaff.length} staff conflicts found.`);
      }

      // Parse scheduled date
      let scheduledDate = scheduleData.scheduledDate;
      if (typeof scheduledDate === 'string' && scheduledDate.includes('T')) {
        scheduledDate = new Date(scheduledDate);
      }

      // Create the daily schedule
      const newSchedule = new DailySchedule({
        taskId: scheduleData.taskId,
        taskTitle: task.title,
        taskCategory: task.category || 'general',
        taskDescription: scheduleData.taskDescription || task.description,
        assignments: assignments,
        priority: scheduleData.priority || 'medium',
        estimatedHours: scheduleData.estimatedHours || this.calculateEstimatedHours(scheduleData.timeSlot),
        scheduledDate: scheduledDate,
        timeSlot: scheduleData.timeSlot || 'full-day',
        customStartTime: scheduleData.customStartTime,
        customEndTime: scheduleData.customEndTime,
        recurrence: scheduleData.recurrence || 'once',
        recurrenceEndDate: scheduleData.recurrenceEndDate,
        department: scheduleData.department || assignments[0]?.department || task.department || 'General',
        location: scheduleData.location || 'Office',
        requiredTools: scheduleData.requiredTools || [],
        sendEmail: scheduleData.sendEmail !== false,
        notes: scheduleData.notes,
        status: 'scheduled',
        createdBy: scheduleData.createdBy,
        overtimeApproved: scheduleData.overtimeApproved || false,
        isHoliday: scheduleData.isHoliday || false,
        enableRotation: scheduleData.enableRotation || false
      });

      await newSchedule.save();
      this.stats.dailySchedulesCreated++;

      // Handle recurrence if specified
      if (scheduleData.recurrence && scheduleData.recurrence !== 'once') {
        await this.handleRecurrence(newSchedule, scheduleData);
      }

      // Send email notifications if enabled
      let notificationResults = [];
      if (scheduleData.sendEmail !== false && assignments.length > 0) {
        try {
          notificationResults = await this.sendDailyScheduleNotifications(newSchedule);
          console.log('📧 Daily schedule email results:', notificationResults);
          this.stats.emailsSent += notificationResults.filter(n => n.success).length;
        } catch (emailError) {
          console.error('❌ Email sending failed for daily schedule:', emailError);
          notificationResults = [{
            success: false,
            error: emailError.message
          }];
        }
      } else if (assignments.length > 0) {
        console.log('📧 Email notifications disabled by user');
      }

      return {
        success: true,
        message: 'Daily schedule created successfully! 📅',
        data: {
          schedule: newSchedule,
          notifications: notificationResults,
          unavailableStaff: unavailableStaff.length > 0 ? unavailableStaff : undefined,
          scheduleId: newSchedule.scheduleId,
          warnings: unavailableStaff.length > 0 ? 
            `${unavailableStaff.length} staff members were unavailable but schedule was created with available staff.` 
            : undefined
        }
      };

    } catch (error) {
      console.error('❌ Error creating daily schedule:', error.message);
      throw error;
    }
  }

  // 🔄 CREATE WEEKLY SCHEDULE FROM DAILY ENDPOINT
  async createWeeklyScheduleFromDaily(scheduleData) {
    try {
      console.log('📆 Creating weekly schedule from daily endpoint:', scheduleData);
      
      // Validate required fields
      if (!scheduleData.taskId || !scheduleData.staffIds || scheduleData.staffIds.length === 0) {
        throw new Error('Task ID and at least one staff member are required');
      }

      if (!scheduleData.startDate || !scheduleData.endDate) {
        throw new Error('Start date and end date are required for weekly schedules');
      }

      const task = await Task.findById(scheduleData.taskId);
      if (!task) {
        throw new Error(`Task with ID ${scheduleData.taskId} not found`);
      }

      // Create multiple daily schedules for each day in the week
      const startDate = new Date(scheduleData.startDate);
      const endDate = new Date(scheduleData.endDate);
      const createdSchedules = [];
      const errors = [];

      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        try {
          // Skip weekends if needed
          if (scheduleData.skipWeekends && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
          }

          // Create daily schedule for this day
          const dailyScheduleData = {
            ...scheduleData,
            scheduledDate: currentDate,
            scheduleType: 'daily', // Override to use daily creation logic
            recurrence: 'once' // Each day is separate
          };

          const result = await this.createDailySchedule(dailyScheduleData);
          createdSchedules.push(result.data.schedule);
          
          console.log(`✅ Created schedule for ${currentDate.toISOString().split('T')[0]}`);
        } catch (error) {
          errors.push({
            date: currentDate.toISOString().split('T')[0],
            error: error.message
          });
          console.error(`❌ Failed to create schedule for ${currentDate.toISOString().split('T')[0]}:`, error.message);
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (createdSchedules.length === 0) {
        throw new Error('Failed to create any schedules for the week');
      }

      return {
        success: true,
        message: `Weekly schedule created with ${createdSchedules.length} days scheduled 📆`,
        data: {
          schedules: createdSchedules,
          errors: errors.length > 0 ? errors : undefined,
          summary: {
            totalDays: createdSchedules.length,
            successfulDays: createdSchedules.length,
            failedDays: errors.length,
            startDate: scheduleData.startDate,
            endDate: scheduleData.endDate
          }
        }
      };

    } catch (error) {
      console.error('❌ Error creating weekly schedule:', error);
      throw error;
    }
  }

  // 🔄 HANDLE RECURRENCE
  async handleRecurrence(parentSchedule, scheduleData) {
    try {
      const recurrenceType = scheduleData.recurrence;
      const endDate = scheduleData.recurrenceEndDate || 
                     this.calculateRecurrenceEndDate(parentSchedule.scheduledDate, recurrenceType);
      let createdCount = 0;

      const baseDate = new Date(parentSchedule.scheduledDate);
      let currentDate = new Date(baseDate);

      // Calculate next occurrence based on recurrence type
      while (currentDate <= endDate && createdCount < 50) { // Limit to 50 occurrences
        currentDate = this.getNextRecurrenceDate(currentDate, recurrenceType);
        
        if (currentDate > endDate) break;

        // Skip weekends for weekdays recurrence
        if (recurrenceType === 'weekdays' && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
          continue;
        }

        // Create recurring schedule
        const recurringSchedule = new DailySchedule({
          ...parentSchedule.toObject(),
          _id: undefined,
          scheduleId: undefined,
          parentScheduleId: parentSchedule.scheduleId,
          scheduledDate: new Date(currentDate),
          createdAt: new Date(),
          updatedAt: new Date()
        });

        await recurringSchedule.save();
        createdCount++;
        this.stats.dailySchedulesCreated++;
        
        console.log(`🔄 Created recurring schedule ${createdCount} for ${currentDate.toISOString().split('T')[0]}`);
      }

      console.log(`✅ Created ${createdCount} recurring schedules`);
      return createdCount;
    } catch (error) {
      console.error('❌ Error handling recurrence:', error);
      throw error;
    }
  }

  // 📧 SEND DAILY SCHEDULE NOTIFICATIONS
  async sendDailyScheduleNotifications(schedule) {
    try {
      console.log(`📧 Starting email notifications for daily schedule: ${schedule.scheduleId}`);
      console.log(`📧 Number of recipients: ${schedule.assignments.length}`);

      if (!schedule.assignments || schedule.assignments.length === 0) {
        console.log('📧 No recipients to send emails to');
        return [];
      }

      // Prepare recipients
      const recipients = schedule.assignments.map(assignment => ({
        id: assignment.staffId.toString(),
        email: assignment.email,
        staffName: assignment.staffName,
        assignment: assignment
      }));

      // Check if email service is available
      if (!emailService || typeof emailService.sendBulkEmails !== 'function') {
        console.warn('📧 Email service not available, skipping email notifications');
        
        // Update assignment statuses even without sending emails
        schedule.assignments.forEach(assignment => {
          assignment.notificationSent = false;
          assignment.emailStatus = 'service_unavailable';
        });
        
        await schedule.save();
        return recipients.map(recipient => ({
          success: false,
          staffName: recipient.staffName,
          email: recipient.email,
          error: 'Email service unavailable'
        }));
      }

      // Send bulk emails
      const emailResult = await emailService.sendBulkEmails(
        recipients,
        `📅 Daily Task Assignment: ${schedule.taskTitle} - ${format(schedule.scheduledDate, 'MMMM dd, yyyy')}`,
        (recipient) => this.generateDailyTaskEmailTemplate(schedule, recipient)
      );

      // Process results and update schedule status
      const notificationResults = [];
      let successfulCount = 0;

      for (let i = 0; i < schedule.assignments.length; i++) {
        const assignment = schedule.assignments[i];
        const emailResultItem = emailResult?.results?.[i] || { success: false, error: 'Email result not available' };

        if (emailResultItem && emailResultItem.success) {
          // Update assignment status
          assignment.notificationSent = true;
          assignment.notificationSentAt = new Date();
          assignment.emailStatus = 'sent';
          assignment.messageId = emailResultItem.messageId;
          
          successfulCount++;
          
          notificationResults.push({
            success: true,
            staffName: assignment.staffName,
            email: assignment.email,
            messageId: emailResultItem.messageId,
            sentAt: new Date()
          });
        } else {
          // Update with failure status
          assignment.notificationSent = false;
          assignment.emailStatus = 'failed';
          assignment.emailError = emailResultItem?.error || 'Unknown error';
          
          notificationResults.push({
            success: false,
            staffName: assignment.staffName,
            email: assignment.email,
            error: assignment.emailError
          });
        }
      }

      // Update schedule email status
      if (successfulCount > 0) {
        schedule.emailSent = true;
        schedule.emailStatus = successfulCount === schedule.assignments.length ? 'all_sent' : 'partial_sent';
        schedule.lastNotificationSent = new Date();
      } else {
        schedule.emailSent = false;
        schedule.emailStatus = 'failed';
      }

      // Save updated schedule
      await schedule.save();
      
      console.log(`📧 Email notification summary:`);
      console.log(`   Total: ${schedule.assignments.length}`);
      console.log(`   Successful: ${successfulCount}`);
      console.log(`   Failed: ${schedule.assignments.length - successfulCount}`);

      return notificationResults;
    } catch (error) {
      console.error('❌ Error sending daily schedule notifications:', error);
      
      // Update schedule with error status
      schedule.assignments.forEach(assignment => {
        assignment.notificationSent = false;
        assignment.emailStatus = 'error';
        assignment.emailError = error.message;
      });
      
      schedule.emailStatus = 'error';
      await schedule.save();
      
      throw error;
    }
  }

  // 📧 GENERATE DAILY TASK EMAIL TEMPLATE
  generateDailyTaskEmailTemplate(schedule, recipient) {
    const scheduleDate = format(schedule.scheduledDate, 'EEEE, MMMM dd, yyyy');
    const startTime = recipient.assignment.startTime || schedule.customStartTime || '09:00';
    const endTime = recipient.assignment.endTime || schedule.customEndTime || '17:00';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { padding: 30px 20px; }
        .task-card { background: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #4F46E5; }
        .task-title { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .task-description { color: #666; line-height: 1.6; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .details-table td { padding: 12px 8px; border-bottom: 1px solid #eee; }
        .details-table td:first-child { font-weight: bold; width: 35%; color: #555; }
        .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .priority-urgent { background: #fee2e2; color: #dc2626; }
        .priority-high { background: #ffedd5; color: #ea580c; }
        .priority-medium { background: #fef3c7; color: #ca8a04; }
        .priority-low { background: #dcfce7; color: #16a34a; }
        .notes-box { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; text-align: center; }
        .action-button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px; }
        .icon { margin-right: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Daily Task Assignment</h1>
          <p>${scheduleDate}</p>
        </div>
        
        <div class="content">
          <h2 style="color: #333; margin-bottom: 5px;">Hello ${recipient.staffName},</h2>
          <p style="color: #666; margin-bottom: 25px;">You have been assigned a new task for your schedule. Here are the details:</p>
          
          <div class="task-card">
            <div class="task-title">${schedule.taskTitle}</div>
            <div class="task-description">${schedule.taskDescription || 'No additional description provided.'}</div>
          </div>
          
          <table class="details-table">
            <tr>
              <td><span class="icon">📅</span> Date:</td>
              <td><strong>${scheduleDate}</strong></td>
            </tr>
            <tr>
              <td><span class="icon">⏰</span> Time Slot:</td>
              <td><strong>${startTime} - ${endTime}</strong></td>
            </tr>
            <tr>
              <td><span class="icon">⏱️</span> Estimated Duration:</td>
              <td><strong>${schedule.estimatedHours} hours</strong></td>
            </tr>
            <tr>
              <td><span class="icon">🚨</span> Priority:</td>
              <td>
                <span class="priority-badge priority-${schedule.priority}">
                  ${schedule.priority.toUpperCase()}
                </span>
              </td>
            </tr>
            <tr>
              <td><span class="icon">🏢</span> Location:</td>
              <td>${schedule.location}</td>
            </tr>
            <tr>
              <td><span class="icon">👥</span> Department:</td>
              <td>${schedule.department}</td>
            </tr>
            <tr>
              <td><span class="icon">🆔</span> Schedule ID:</td>
              <td><code>${schedule.scheduleId}</code></td>
            </tr>
          </table>
          
          ${schedule.notes ? `
          <div class="notes-box">
            <strong style="color: #ea580c;">📝 Additional Notes:</strong><br>
            ${schedule.notes}
          </div>
          ` : ''}
          
          ${schedule.requiredTools && schedule.requiredTools.length > 0 ? `
          <div style="margin: 20px 0;">
            <strong style="color: #555;">🔧 Required Tools:</strong><br>
            ${schedule.requiredTools.map(tool => `• ${tool}`).join('<br>')}
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" class="action-button">View Full Task Details</a>
            <a href="#" class="action-button" style="background: #10b981;">Confirm Availability</a>
          </div>
          
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong style="color: #475569;">ℹ️ Important Information:</strong><br>
            • Please arrive 15 minutes before your scheduled time<br>
            • Contact your supervisor if you have any questions<br>
            • Report any issues immediately
          </div>
          
          <div class="footer">
            <p>This is an automated notification. Please do not reply to this email.</p>
            <p>Schedule ID: ${schedule.scheduleId} | Generated: ${format(new Date(), 'MMM dd, yyyy hh:mm a')}</p>
            <p>If you have any questions, please contact your supervisor or department head.</p>
            <p style="margin-top: 15px; color: #999;">© ${new Date().getFullYear()} Task Scheduler System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // 📋 GET DAILY SCHEDULES WITH FILTERS
  async getDailySchedules(filters = {}) {
    try {
      let query = {};
      
      // Apply filters
      if (filters.date) {
        const date = new Date(filters.date);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        query.scheduledDate = {
          $gte: startOfDay(date),
          $lt: endOfDay(date)
        };
      }
      
      if (filters.startDate && filters.endDate) {
        query.scheduledDate = {
          $gte: startOfDay(new Date(filters.startDate)),
          $lte: endOfDay(new Date(filters.endDate))
        };
      }
      
      if (filters.staffId) {
        query['assignments.staffId'] = filters.staffId;
      }
      
      if (filters.status && filters.status !== 'all') {
        query.status = filters.status;
      }
      
      if (filters.priority && filters.priority !== 'all') {
        query.priority = filters.priority;
      }
      
      if (filters.department) {
        query.department = filters.department;
      }
      
      if (filters.taskCategory) {
        query.taskCategory = filters.taskCategory;
      }
      
      if (filters.timeSlot && filters.timeSlot !== 'all') {
        query.timeSlot = filters.timeSlot;
      }
      
      // Search functionality
      if (filters.search) {
        const searchRegex = new RegExp(filters.search, 'i');
        query.$or = [
          { taskTitle: searchRegex },
          { scheduleId: searchRegex },
          { 'assignments.staffName': searchRegex },
          { taskDescription: searchRegex }
        ];
      }

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const skip = (page - 1) * limit;

      const [schedules, total] = await Promise.all([
        DailySchedule.find(query)
          .populate('taskId', 'title category description')
          .populate({
            path: 'assignments.staffId',
            select: 'firstName lastName email department avatarColor',
            model: 'Staff'
          })
          .populate('createdBy', 'firstName lastName')
          .sort({ scheduledDate: -1, 'customStartTime': 1 })
          .skip(skip)
          .limit(limit),
        DailySchedule.countDocuments(query)
      ]);

      return {
        success: true,
        count: schedules.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: schedules,
        filters: filters
      };
    } catch (error) {
      console.error('❌ Error fetching daily schedules:', error);
      throw error;
    }
  }

  // 📅 GET TODAY'S SCHEDULES
  async getTodaySchedules(staffId = null) {
    try {
      const today = new Date();
      const start = startOfDay(today);
      const end = endOfDay(today);
      
      let query = {
        scheduledDate: {
          $gte: start,
          $lt: end
        }
      };
      
      if (staffId) {
        query['assignments.staffId'] = staffId;
      }

      const schedules = await DailySchedule.find(query)
        .populate('taskId', 'title category')
        .populate('assignments.staffId', 'firstName lastName email')
        .sort({ 'customStartTime': 1 });

      const summary = {
        totalTasks: schedules.length,
        totalStaff: schedules.reduce((sum, s) => sum + (s.assignments?.length || 0), 0),
        totalHours: schedules.reduce((sum, s) => sum + (s.estimatedHours || 0), 0),
        pendingTasks: schedules.filter(s => s.status === 'scheduled').length,
        inProgressTasks: schedules.filter(s => s.status === 'in-progress').length,
        completedTasks: schedules.filter(s => s.status === 'completed').length
      };

      return {
        success: true,
        count: schedules.length,
        data: schedules,
        date: format(today, 'yyyy-MM-dd'),
        summary
      };
    } catch (error) {
      console.error('❌ Error fetching today\'s schedules:', error);
      throw error;
    }
  }

  // 📅 GET SCHEDULES BY DATE RANGE
  async getSchedulesByDateRange(startDate, endDate, filters = {}) {
    try {
      const query = {
        scheduledDate: {
          $gte: startOfDay(new Date(startDate)),
          $lte: endOfDay(new Date(endDate))
        }
      };

      // Apply additional filters
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.department) {
        query.department = filters.department;
      }
      
      if (filters.staffId) {
        query['assignments.staffId'] = filters.staffId;
      }

      const schedules = await DailySchedule.find(query)
        .populate('taskId', 'title category')
        .populate('assignments.staffId', 'firstName lastName email')
        .sort({ scheduledDate: 1, 'customStartTime': 1 });

      const period = {
        startDate: format(new Date(startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(endDate), 'yyyy-MM-dd'),
        days: Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
      };

      return {
        success: true,
        count: schedules.length,
        data: schedules,
        period
      };
    } catch (error) {
      console.error('❌ Error fetching schedules by date range:', error);
      throw error;
    }
  }

  // 🔍 GET DAILY SCHEDULE BY ID
  async getDailyScheduleById(id) {
    try {
      const schedule = await DailySchedule.findById(id)
        .populate('taskId', 'title category description estimatedHours')
        .populate('assignments.staffId', 'firstName lastName email department phone position')
        .populate('createdBy', 'firstName lastName email');

      if (!schedule) {
        throw new Error('Daily schedule not found');
      }

      return {
        success: true,
        data: schedule
      };
    } catch (error) {
      console.error('❌ Error fetching daily schedule:', error);
      throw error;
    }
  }

  // 🔄 UPDATE DAILY SCHEDULE
  async updateDailySchedule(id, updateData) {
    try {
      const schedule = await DailySchedule.findById(id);
      
      if (!schedule) {
        throw new Error('Daily schedule not found');
      }

      // Update allowed fields
      const allowedUpdates = [
        'priority', 'estimatedHours', 'scheduledDate', 'timeSlot',
        'customStartTime', 'customEndTime', 'status', 'department',
        'location', 'notes', 'overtimeApproved', 'sendEmail',
        'taskDescription', 'taskCategory', 'requiredTools', 'isHoliday'
      ];
      
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          schedule[field] = updateData[field];
        }
      });

      // Update assignments if provided
      if (updateData.assignments && Array.isArray(updateData.assignments)) {
        schedule.assignments = updateData.assignments;
      }

      // Update status-based timestamps
      if (updateData.status === 'completed') {
        schedule.completedAt = new Date();
      }

      await schedule.save();

      return {
        success: true,
        message: 'Daily schedule updated successfully',
        data: schedule
      };
    } catch (error) {
      console.error('❌ Error updating daily schedule:', error);
      throw error;
    }
  }

  // 🔄 UPDATE ASSIGNMENT STATUS
  async updateAssignmentStatus(scheduleId, staffId, updateData) {
    try {
      const schedule = await DailySchedule.findById(scheduleId);
      
      if (!schedule) {
        throw new Error('Daily schedule not found');
      }

      const assignment = schedule.assignments.find(a => 
        a.staffId && a.staffId.toString() === staffId.toString()
      );
      
      if (!assignment) {
        throw new Error('Assignment not found for this staff member');
      }

      // Update assignment fields
      if (updateData.status) {
        assignment.status = updateData.status;
        
        // Set completed at timestamp if status is completed
        if (updateData.status === 'completed') {
          assignment.completedAt = new Date();
        }
      }
      
      if (updateData.notes !== undefined) assignment.notes = updateData.notes;
      if (updateData.hoursWorked !== undefined) assignment.hoursWorked = updateData.hoursWorked;
      if (updateData.rating !== undefined) assignment.rating = updateData.rating;
      if (updateData.feedback !== undefined) assignment.feedback = updateData.feedback;
      if (updateData.startTime !== undefined) assignment.startTime = updateData.startTime;
      if (updateData.endTime !== undefined) assignment.endTime = updateData.endTime;

      await schedule.save();

      return {
        success: true,
        message: 'Assignment status updated successfully',
        data: {
          scheduleId: schedule.scheduleId,
          assignment: assignment
        }
      };
    } catch (error) {
      console.error('❌ Error updating assignment status:', error);
      throw error;
    }
  }

  // ❌ DELETE DAILY SCHEDULE
  async deleteDailySchedule(id) {
    try {
      const schedule = await DailySchedule.findById(id);
      
      if (!schedule) {
        throw new Error('Daily schedule not found');
      }

      // Store info before deletion
      const scheduleInfo = {
        scheduleId: schedule.scheduleId,
        taskTitle: schedule.taskTitle,
        scheduledDate: schedule.scheduledDate
      };

      // Also delete any child recurring schedules
      if (schedule.parentScheduleId) {
        await DailySchedule.deleteMany({ parentScheduleId: schedule.parentScheduleId });
      }

      await schedule.deleteOne();

      return {
        success: true,
        message: 'Daily schedule deleted successfully',
        data: {
          ...scheduleInfo,
          deletedAt: new Date()
        }
      };
    } catch (error) {
      console.error('❌ Error deleting daily schedule:', error);
      throw error;
    }
  }

  // 👥 GET STAFF DAILY WORKLOAD
  async getStaffDailyWorkload(staffId, date) {
    try {
      const staff = await Staff.findById(staffId);
      if (!staff) {
        throw new Error('Staff not found');
      }

      const targetDate = new Date(date);
      const start = startOfDay(targetDate);
      const end = endOfDay(targetDate);

      const schedules = await DailySchedule.find({
        'assignments.staffId': staffId,
        scheduledDate: {
          $gte: start,
          $lt: end
        }
      })
      .populate('taskId', 'title category')
      .sort({ 'customStartTime': 1 });

      const totalHours = schedules.reduce((sum, schedule) => sum + (schedule.estimatedHours || 0), 0);
      
      const assignments = schedules.flatMap(schedule => 
        schedule.assignments
          .filter(a => a.staffId && a.staffId.toString() === staffId.toString())
          .map(assignment => ({
            assignment,
            schedule
          }))
      );
      
      const completedTasks = assignments.filter(({ assignment }) => 
        assignment.status === 'completed'
      ).length;

      return {
        success: true,
        data: {
          staff: {
            id: staff._id,
            name: `${staff.firstName} ${staff.lastName}`,
            department: staff.department,
            email: staff.email,
            position: staff.position
          },
          date: format(targetDate, 'yyyy-MM-dd'),
          workload: {
            totalSchedules: schedules.length,
            totalHours,
            completedTasks,
            pendingTasks: assignments.length - completedTasks,
            schedules: assignments.map(({ assignment, schedule }) => ({
              id: schedule._id,
              scheduleId: schedule.scheduleId,
              taskTitle: schedule.taskTitle,
              scheduledDate: schedule.scheduledDate,
              startTime: assignment.startTime || schedule.customStartTime,
              endTime: assignment.endTime || schedule.customEndTime,
              estimatedHours: schedule.estimatedHours,
              priority: schedule.priority,
              status: assignment.status,
              location: schedule.location,
              notes: assignment.notes
            }))
          }
        }
      };
    } catch (error) {
      console.error('❌ Error getting staff daily workload:', error);
      throw error;
    }
  }

  // 📊 GET DAILY SCHEDULE STATISTICS
  async getDailyStatistics(startDate, endDate) {
    try {
      const start = startOfDay(new Date(startDate));
      const end = endOfDay(new Date(endDate));

      const stats = await DailySchedule.aggregate([
        {
          $match: {
            scheduledDate: {
              $gte: start,
              $lte: end
            }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$scheduledDate" } },
              status: "$status"
            },
            count: { $sum: 1 },
            totalHours: { $sum: "$estimatedHours" },
            staffCount: { $sum: { $size: "$assignments" } }
          }
        },
        {
          $group: {
            _id: "$_id.date",
            statuses: {
              $push: {
                status: "$_id.status",
                count: "$count",
                totalHours: "$totalHours",
                staffCount: "$staffCount"
              }
            },
            totalSchedules: { $sum: "$count" },
            totalHours: { $sum: "$totalHours" },
            totalStaff: { $sum: "$staffCount" }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // Calculate summary statistics
      const totalSchedules = stats.reduce((sum, day) => sum + day.totalSchedules, 0);
      const totalHours = stats.reduce((sum, day) => sum + day.totalHours, 0);
      const totalStaff = stats.reduce((sum, day) => sum + day.totalStaff, 0);

      return {
        success: true,
        data: {
          period: {
            startDate: format(start, 'yyyy-MM-dd'),
            endDate: format(end, 'yyyy-MM-dd'),
            days: stats.length
          },
          summary: {
            totalSchedules,
            totalHours,
            totalStaff,
            averageDailySchedules: totalSchedules / Math.max(stats.length, 1),
            averageDailyHours: totalHours / Math.max(stats.length, 1)
          },
          dailyStats: stats
        }
      };
    } catch (error) {
      console.error('❌ Error getting daily statistics:', error);
      throw error;
    }
  }

  // 🎯 CHECK STAFF AVAILABILITY
  async checkStaffAvailability(staffId, date, timeSlot = 'full-day') {
    try {
      const staff = await Staff.findById(staffId);
      if (!staff) {
        throw new Error('Staff not found');
      }

      const availability = await DailySchedule.checkStaffAvailability(staffId, date, timeSlot);
      
      return {
        success: true,
        data: {
          staff: {
            id: staff._id,
            name: `${staff.firstName} ${staff.lastName}`,
            department: staff.department
          },
          date: format(new Date(date), 'yyyy-MM-dd'),
          timeSlot,
          availability
        }
      };
    } catch (error) {
      console.error('❌ Error checking staff availability:', error);
      throw error;
    }
  }

  // 🔧 HELPER METHODS
  getDefaultStartTime(timeSlot) {
    switch (timeSlot) {
      case 'morning': return '09:00';
      case 'afternoon': return '13:00';
      case 'full-day': return '09:00';
      case 'custom': return '09:00';
      default: return '09:00';
    }
  }

  getDefaultEndTime(timeSlot) {
    switch (timeSlot) {
      case 'morning': return '12:00';
      case 'afternoon': return '17:00';
      case 'full-day': return '17:00';
      case 'custom': return '17:00';
      default: return '17:00';
    }
  }

  calculateEstimatedHours(timeSlot) {
    switch (timeSlot) {
      case 'morning': return 3;
      case 'afternoon': return 4;
      case 'full-day': return 8;
      case 'custom': return 8;
      default: return 8;
    }
  }

  getPriorityColor(priority) {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  }

  calculateRecurrenceEndDate(startDate, recurrenceType) {
    const endDate = new Date(startDate);
    switch (recurrenceType) {
      case 'daily':
        endDate.setDate(endDate.getDate() + 30); // 30 days
        break;
      case 'weekdays':
        endDate.setDate(endDate.getDate() + 90); // ~3 months (weekdays only)
        break;
      case 'weekly':
        endDate.setDate(endDate.getDate() + 365); // 1 year
        break;
      default:
        endDate.setDate(endDate.getDate() + 30);
    }
    return endDate;
  }

  getNextRecurrenceDate(currentDate, recurrenceType) {
    const nextDate = new Date(currentDate);
    
    switch (recurrenceType) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekdays':
        do {
          nextDate.setDate(nextDate.getDate() + 1);
        } while (nextDate.getDay() === 0 || nextDate.getDay() === 6); // Skip weekends
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      default:
        nextDate.setDate(nextDate.getDate() + 1);
    }
    
    return nextDate;
  }

  // 🧪 TEST DAILY SCHEDULE SERVICE
  async testService() {
    try {
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);
      
      const stats = {
        totalSchedules: await DailySchedule.countDocuments(),
        todaySchedules: await DailySchedule.countDocuments({
          scheduledDate: {
            $gte: startOfToday,
            $lt: endOfToday
          }
        }),
        upcomingSchedules: await DailySchedule.countDocuments({
          scheduledDate: { $gt: new Date() },
          status: 'scheduled'
        }),
        completedSchedules: await DailySchedule.countDocuments({
          status: 'completed'
        }),
        serviceStats: this.stats
      };
      
      return {
        success: true,
        message: 'Daily Schedule Service is operational ✅',
        timestamp: new Date().toISOString(),
        stats
      };
    } catch (error) {
      console.error('❌ Error testing daily schedule service:', error);
      throw error;
    }
  }
}

module.exports = new DailyScheduleService();