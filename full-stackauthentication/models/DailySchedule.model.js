const mongoose = require('mongoose');
const { format } = require('date-fns');

const dailyAssignmentSchema = new mongoose.Schema({
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
    required: true,
    lowercase: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'overdue', 'cancelled'],
    default: 'pending'
  },
  startTime: {
    type: String,
    default: '09:00',
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:MM)`
    }
  },
  endTime: {
    type: String,
    default: '17:00',
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:MM)`
    }
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  hoursWorked: {
    type: Number,
    min: 0,
    max: 24,
    default: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  notificationSentAt: Date,
  emailStatus: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'service_unavailable'],
    default: 'pending'
  },
  emailError: String,
  messageId: String,
  department: {
    type: String,
    default: 'General'
  }
}, { _id: true });

const dailyScheduleSchema = new mongoose.Schema({
  scheduleType: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  taskTitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  taskDescription: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  taskCategory: {
    type: String,
    default: 'general',
    index: true
  },
  assignments: [dailyAssignmentSchema],
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
  timeSlot: {
    type: String,
    enum: ['morning', 'afternoon', 'full-day', 'custom'],
    default: 'full-day'
  },
  customStartTime: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:MM)`
    }
  },
  customEndTime: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:MM)`
    }
  },
  recurrence: {
    type: String,
    enum: ['once', 'daily', 'weekdays', 'weekly'],
    default: 'once'
  },
  recurrenceEndDate: Date,
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  location: {
    type: String,
    default: 'Office',
    maxlength: 200
  },
  department: {
    type: String,
    index: true,
    default: 'General'
  },
  requiredTools: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  sendEmail: {
    type: Boolean,
    default: true
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailStatus: {
    type: String,
    enum: ['not_sent', 'partial_sent', 'all_sent', 'failed', 'error'],
    default: 'not_sent'
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
    trim: true,
    maxlength: 1000
  },
  scheduleId: {
    type: String,
    unique: true,
    index: true,
    sparse: true
  },
  parentScheduleId: {
    type: String,
    index: true
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6
  },
  isHoliday: {
    type: Boolean,
    default: false
  },
  overtimeApproved: {
    type: Boolean,
    default: false
  },
  enableRotation: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
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
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better query performance
dailyScheduleSchema.index({ scheduledDate: 1, status: 1 });
dailyScheduleSchema.index({ 'assignments.staffId': 1, scheduledDate: 1 });
dailyScheduleSchema.index({ scheduleId: 1 }, { unique: true, sparse: true });
dailyScheduleSchema.index({ department: 1, scheduledDate: 1 });
dailyScheduleSchema.index({ taskCategory: 1, scheduledDate: 1 });
dailyScheduleSchema.index({ priority: 1, scheduledDate: 1 });
dailyScheduleSchema.index({ createdBy: 1, scheduledDate: 1 });

// Pre-save middleware to generate schedule ID
dailyScheduleSchema.pre('save', function(next) {
  // Generate schedule ID if not present
  if (!this.scheduleId) {
    this.scheduleId = this.generateScheduleId();
  }
  
  // Set day of week
  if (this.scheduledDate) {
    const date = new Date(this.scheduledDate);
    this.dayOfWeek = date.getDay();
  }
  
  // Set default times based on time slot if custom times are not provided
  if (this.timeSlot === 'morning' && !this.customStartTime) {
    this.customStartTime = '09:00';
    this.customEndTime = '12:00';
  } else if (this.timeSlot === 'afternoon' && !this.customStartTime) {
    this.customStartTime = '13:00';
    this.customEndTime = '17:00';
  } else if (this.timeSlot === 'full-day' && !this.customStartTime) {
    this.customStartTime = '09:00';
    this.customEndTime = '17:00';
  }
  
  // Update timestamp
  this.updatedAt = Date.now();
  
  // Auto-update status based on scheduled date
  const now = new Date();
  const scheduleDate = new Date(this.scheduledDate);
  
  if (this.status === 'scheduled' && scheduleDate < now) {
    this.status = 'in-progress';
  }
  
  next();
});

// Post-save middleware to update statistics
dailyScheduleSchema.post('save', function(doc) {
  console.log(`📊 Daily schedule saved: ${doc.scheduleId} - ${doc.taskTitle}`);
});

// Virtual for formatted date
dailyScheduleSchema.virtual('formattedDate').get(function() {
  if (!this.scheduledDate) return '';
  return format(new Date(this.scheduledDate), 'EEEE, MMMM dd, yyyy');
});

// Virtual for checking if schedule is for today
dailyScheduleSchema.virtual('isToday').get(function() {
  if (!this.scheduledDate) return false;
  const today = new Date();
  const scheduleDate = new Date(this.scheduledDate);
  return scheduleDate.getDate() === today.getDate() &&
         scheduleDate.getMonth() === today.getMonth() &&
         scheduleDate.getFullYear() === today.getFullYear();
});

// Virtual for checking if schedule is upcoming
dailyScheduleSchema.virtual('isUpcoming').get(function() {
  if (!this.scheduledDate) return false;
  return this.status === 'scheduled' && new Date(this.scheduledDate) > new Date();
});

// Virtual for checking if schedule is overdue
dailyScheduleSchema.virtual('isOverdue').get(function() {
  if (!this.scheduledDate) return false;
  return this.status !== 'completed' && new Date(this.scheduledDate) < new Date();
});

// Virtual for duration string
dailyScheduleSchema.virtual('duration').get(function() {
  if (this.customStartTime && this.customEndTime) {
    return `${this.customStartTime} - ${this.customEndTime}`;
  }
  return `${this.timeSlot} (${this.estimatedHours}h)`;
});

// Instance method to generate schedule ID
dailyScheduleSchema.methods.generateScheduleId = function() {
  const prefix = 'DAY';
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const day = new Date().getDate().toString().padStart(2, '0');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}${year}${month}${day}${randomNum}${timestamp}`;
};

// Instance method to check if staff is available
dailyScheduleSchema.methods.isStaffAvailable = async function(staffId, date, startTime, endTime) {
  const scheduleDate = new Date(date);
  const startOfDay = new Date(scheduleDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(scheduleDate.setHours(23, 59, 59, 999));
  
  // Check for existing schedules for the same staff on same date/time
  const existingSchedule = await this.constructor.findOne({
    'assignments.staffId': staffId,
    scheduledDate: {
      $gte: startOfDay,
      $lt: endOfDay
    },
    status: { $in: ['scheduled', 'in-progress'] },
    _id: { $ne: this._id }
  });
  
  return !existingSchedule;
};

// Static method to get today's schedules
dailyScheduleSchema.statics.getTodaySchedules = function(staffId = null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const query = {
    scheduledDate: {
      $gte: today,
      $lt: tomorrow
    }
  };
  
  if (staffId) {
    query['assignments.staffId'] = staffId;
  }
  
  return this.find(query)
    .populate('taskId', 'title category')
    .populate('assignments.staffId', 'firstName lastName email department')
    .sort({ 'customStartTime': 1 });
};

// Static method to get upcoming daily schedules
dailyScheduleSchema.statics.getUpcomingDailySchedules = function(days = 7, staffId = null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);
  
  const query = {
    scheduledDate: {
      $gte: today,
      $lte: futureDate
    },
    status: { $in: ['scheduled', 'in-progress'] }
  };
  
  if (staffId) {
    query['assignments.staffId'] = staffId;
  }
  
  return this.find(query)
    .populate('taskId', 'title category')
    .populate('assignments.staffId', 'firstName lastName email')
    .sort({ scheduledDate: 1, 'customStartTime': 1 });
};

// Static method to check date availability for staff
dailyScheduleSchema.statics.checkStaffAvailability = async function(staffId, date, timeSlot = 'full-day') {
  const scheduleDate = new Date(date);
  const startOfDay = new Date(scheduleDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(scheduleDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const existingSchedules = await this.find({
    'assignments.staffId': staffId,
    scheduledDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['scheduled', 'in-progress'] }
  });
  
  const busyHours = [];
  existingSchedules.forEach(schedule => {
    if (schedule.customStartTime && schedule.customEndTime) {
      busyHours.push({
        start: schedule.customStartTime,
        end: schedule.customEndTime,
        task: schedule.taskTitle
      });
    }
  });
  
  const isAvailable = existingSchedules.length === 0;
  
  return {
    isAvailable,
    busyHours,
    existingSchedules: existingSchedules.map(s => ({
      id: s._id,
      scheduleId: s.scheduleId,
      taskTitle: s.taskTitle,
      timeSlot: s.timeSlot,
      startTime: s.customStartTime,
      endTime: s.customEndTime,
      status: s.status
    })),
    existingSchedulesCount: existingSchedules.length,
    recommendation: isAvailable ? 
      'Staff is available for scheduling' : 
      'Staff has existing schedules on this date'
  };
};

// Static method to get daily schedule statistics
dailyScheduleSchema.statics.getDailyStatistics = async function(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const stats = await this.aggregate([
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
  
  return stats;
};

// Static method to get schedules by date range
dailyScheduleSchema.statics.getSchedulesByDateRange = function(startDate, endDate, filters = {}) {
  const query = {
    scheduledDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
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

  return this.find(query)
    .populate('taskId', 'title category')
    .populate('assignments.staffId', 'firstName lastName email')
    .sort({ scheduledDate: 1, 'customStartTime': 1 });
};

const DailySchedule = mongoose.model('DailySchedule', dailyScheduleSchema);
module.exports = DailySchedule;