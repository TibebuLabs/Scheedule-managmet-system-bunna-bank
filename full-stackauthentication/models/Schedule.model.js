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

// Indexes
scheduleSchema.index({ scheduleType: 1, scheduledDate: 1, status: 1 });
scheduleSchema.index({ 'assignments.staffId': 1, scheduledDate: 1 });
scheduleSchema.index({ scheduleType: 1, weekNumber: 1, year: 1 });

// Pre-save middleware
scheduleSchema.pre('save', function(next) {
  if (!this.scheduleId) {
    const prefix = this.scheduleType === 'weekly' ? 'WKS' : 'DYS';
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const day = new Date().getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.scheduleId = `${prefix}${year}${month}${day}${randomNum}`;
  }
  
  // Calculate week number, month, and year
  if (this.scheduledDate) {
    const date = new Date(this.scheduledDate);
    this.weekNumber = getWeekNumber(date);
    this.month = date.getMonth() + 1;
    this.year = date.getFullYear();
  }
  
  // For daily schedules, set endDate if not provided
  if (this.scheduleType === 'daily' && !this.endDate && this.scheduledDate && this.estimatedHours) {
    this.endDate = new Date(this.scheduledDate.getTime() + this.estimatedHours * 60 * 60 * 1000);
  }
  
  // For weekly schedules, ensure endDate is set
  if (this.scheduleType === 'weekly' && !this.endDate && this.scheduledDate) {
    const endDate = new Date(this.scheduledDate);
    endDate.setDate(endDate.getDate() + 7); // Default to 7 days for weekly
    this.endDate = endDate;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;