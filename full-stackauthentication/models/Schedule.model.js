const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  staffName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'overdue', 'cancelled'],
    default: 'pending'
  },
  completedAt: Date,
  notes: String,
  hoursWorked: {
    type: Number,
    min: 0,
    max: 24
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,
  notificationSent: {
    type: Boolean,
    default: false
  },
  notificationSentAt: Date,
  rotationStatus: {
    type: String,
    enum: ['new', 'rotated', 'maintained'],
    default: 'new'
  }
});

const scheduleSchema = new mongoose.Schema({
  scheduleType: {
    type: String,
    enum: ['daily', 'weekly'],
    required: true,
    index: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  taskTitle: {
    type: String,
    required: true,
    trim: true
  },
  taskDescription: {
    type: String,
    trim: true
  },
  taskCategory: {
    type: String,
    default: 'general',
    index: true
  },
  assignments: [assignmentSchema],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  estimatedHours: {
    type: Number,
    min: 0.5,
    max: 24,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    index: true
  },
  recurrence: {
    type: String,
    enum: ['once', 'daily', 'weekly'],
    default: 'once'
  },
  recurrenceEndDate: Date,
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'overdue'],
    default: 'scheduled',
    index: true
  },
  location: {
    type: String,
    default: 'Office'
  },
  department: {
    type: String,
    index: true
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  sendEmail: {
    type: Boolean,
    default: true
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  lastNotificationSent: Date,
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    trim: true
  },
  scheduleId: {
    type: String,
    unique: true,
    index: true
  },
  parentScheduleId: {
    type: String,
    index: true
  },
  weekNumber: {
    type: Number,
    index: true
  },
  month: {
    type: Number,
    index: true
  },
  year: {
    type: Number,
    index: true
  },
  enableRotation: {
    type: Boolean,
    default: false
  },
  weeklyLimitsEnforced: {
    type: Boolean,
    default: false
  },
  skipWeekends: {
    type: Boolean,
    default: false
  },
  excludeDates: [Date],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
scheduleSchema.index({ scheduledDate: 1, scheduleType: 1 });
scheduleSchema.index({ status: 1, scheduleType: 1 });
scheduleSchema.index({ 'assignments.staffId': 1, scheduledDate: 1 });
scheduleSchema.index({ scheduleId: 1 }, { unique: true });
scheduleSchema.index({ department: 1, scheduleType: 1 });
scheduleSchema.index({ weekNumber: 1, scheduleType: 1 });
scheduleSchema.index({ taskCategory: 1, 'assignments.staffId': 1, scheduledDate: 1 });
scheduleSchema.index({ 'assignments.staffId': 1, scheduledDate: 1, scheduleType: 1 });

// Compound indexes for common queries
scheduleSchema.index({ 
  scheduleType: 1, 
  status: 1, 
  scheduledDate: 1 
});

scheduleSchema.index({ 
  'assignments.staffId': 1, 
  scheduleType: 1, 
  status: 1 
});

// Pre-save middleware to generate schedule ID, week number, month, and year
scheduleSchema.pre('save', function(next) {
  if (!this.scheduleId) {
    this.scheduleId = this.generateScheduleId();
  }
  
  // Calculate week number, month, and year
  if (this.scheduledDate) {
    const date = new Date(this.scheduledDate);
    this.weekNumber = this.calculateWeekNumber(date);
    this.month = date.getMonth() + 1;
    this.year = date.getFullYear();
  }
  
  // Ensure endDate is set if not provided
  if (!this.endDate && this.scheduledDate && this.estimatedHours) {
    this.endDate = new Date(this.scheduledDate.getTime() + this.estimatedHours * 60 * 60 * 1000);
  }
  
  // Update timestamp
  this.updatedAt = Date.now();
  
  next();
});

// Pre-save middleware to validate weekly schedule constraints
scheduleSchema.pre('save', async function(next) {
  if (this.scheduleType === 'weekly' && this.isModified('assignments')) {
    try {
      // Check if same staff were assigned to similar task last week
      const oneWeekAgo = new Date(this.scheduledDate);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const similarTask = await mongoose.model('Schedule').findOne({
        taskId: this.taskId,
        'assignments.staffId': { $in: this.assignments.map(a => a.staffId) },
        scheduledDate: { 
          $gte: oneWeekAgo,
          $lt: this.scheduledDate
        },
        status: { $in: ['completed'] }
      });
      
      if (similarTask && this.enableRotation) {
        // Mark assignments as rotated
        this.assignments.forEach(assignment => {
          if (similarTask.assignments.some(a => a.staffId.equals(assignment.staffId))) {
            assignment.rotationStatus = 'rotated';
          }
        });
      }
    } catch (error) {
      console.error('Error validating weekly schedule:', error);
    }
  }
  next();
});

// Virtual for duration in hours
scheduleSchema.virtual('durationHours').get(function() {
  if (!this.endDate || !this.scheduledDate) return this.estimatedHours;
  return (this.endDate - this.scheduledDate) / (1000 * 60 * 60);
});

// Virtual for checking if schedule is active
scheduleSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'scheduled' && this.scheduledDate <= now && 
         (!this.endDate || this.endDate >= now);
});

// Virtual for checking if schedule is upcoming
scheduleSchema.virtual('isUpcoming').get(function() {
  return this.status === 'scheduled' && this.scheduledDate > new Date();
});

// Instance method to check if schedule is for today
scheduleSchema.methods.isToday = function() {
  const today = new Date();
  const scheduleDate = new Date(this.scheduledDate);
  return scheduleDate.getDate() === today.getDate() &&
         scheduleDate.getMonth() === today.getMonth() &&
         scheduleDate.getFullYear() === today.getFullYear();
};

// Instance method to check if schedule is for this week
scheduleSchema.methods.isThisWeek = function() {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  
  return this.scheduledDate >= startOfWeek && this.scheduledDate <= endOfWeek;
};

// Static method to check staff availability with schedule type consideration
scheduleSchema.statics.checkStaffAvailability = async function(staffId, date, hours, scheduleType = 'daily') {
  const startDate = new Date(date);
  const endDate = new Date(startDate.getTime() + hours * 60 * 60 * 1000);
  
  const query = {
    'assignments.staffId': staffId,
    status: { $in: ['scheduled', 'in-progress'] },
    $or: [
      {
        scheduledDate: { $lt: endDate },
        endDate: { $gt: startDate }
      }
    ]
  };
  
  // Additional constraints for weekly schedules
  if (scheduleType === 'weekly') {
    const oneWeekAgo = new Date(startDate);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekLater = new Date(startDate);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    
    query.$or.push({
      scheduleType: 'weekly',
      scheduledDate: { 
        $gte: oneWeekAgo,
        $lte: oneWeekLater
      }
    });
  }
  
  const conflictingSchedules = await this.find(query);
  
  return {
    available: conflictingSchedules.length === 0,
    conflicts: conflictingSchedules
  };
};

// Static method to get weekly schedules for a staff member
scheduleSchema.statics.getWeeklySchedules = async function(staffId, startDate, endDate) {
  return this.find({
    'assignments.staffId': staffId,
    scheduleType: 'weekly',
    scheduledDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    status: { $in: ['scheduled', 'in-progress'] }
  }).sort({ scheduledDate: 1 });
};

// Static method to get daily schedules for a staff member
scheduleSchema.statics.getDailySchedules = async function(staffId, date) {
  const targetDate = new Date(date);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);
  
  return this.find({
    'assignments.staffId': staffId,
    scheduleType: 'daily',
    scheduledDate: {
      $gte: targetDate,
      $lt: nextDay
    },
    status: { $in: ['scheduled', 'in-progress'] }
  }).sort({ scheduledDate: 1 });
};

// Helper method to generate schedule ID
scheduleSchema.methods.generateScheduleId = function() {
  const prefix = this.scheduleType === 'weekly' ? 'WKS' : 'DYS';
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const day = new Date().getDate().toString().padStart(2, '0');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${year}${month}${day}${randomNum}`;
};

// Helper method to calculate week number
scheduleSchema.methods.calculateWeekNumber = function(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

// Static method to get schedules by week number
scheduleSchema.statics.findByWeekNumber = function(weekNumber, year = new Date().getFullYear()) {
  return this.find({
    weekNumber: weekNumber,
    scheduledDate: {
      $gte: new Date(year, 0, 1),
      $lt: new Date(year + 1, 0, 1)
    }
  });
};

// Static method to get schedules by month and year
scheduleSchema.statics.findByMonthYear = function(month, year) {
  return this.find({
    month: month,
    year: year
  });
};

// Static method to get schedule statistics
scheduleSchema.statics.getStatistics = async function(startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        scheduledDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$scheduleType',
        count: { $sum: 1 },
        totalHours: { $sum: '$estimatedHours' },
        avgHours: { $avg: '$estimatedHours' },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats;
};

// Static method to check weekly limits for staff
scheduleSchema.statics.checkWeeklyLimits = async function(staffId, startDate, endDate, maxHours = 40) {
  const schedules = await this.find({
    'assignments.staffId': staffId,
    scheduleType: 'weekly',
    scheduledDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    status: { $in: ['scheduled', 'in-progress'] }
  });
  
  const totalHours = schedules.reduce((sum, schedule) => sum + schedule.estimatedHours, 0);
  
  return {
    totalHours,
    withinLimit: totalHours <= maxHours,
    remainingHours: Math.max(0, maxHours - totalHours),
    schedulesCount: schedules.length
  };
};

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;