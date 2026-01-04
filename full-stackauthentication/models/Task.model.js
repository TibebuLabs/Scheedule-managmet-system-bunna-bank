const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [3, 'Task title must be at least 3 characters'],
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  taskId: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to generate task ID
taskSchema.pre('save', function(next) {
  if (!this.taskId) {
    const prefix = 'TASK';
    const year = new Date().getFullYear().toString().slice(-2);
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    this.taskId = `${prefix}${year}${randomNum}`;
  }
  
  // Update timestamp
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
taskSchema.index({ taskId: 1 }, { unique: true });
taskSchema.index({ status: 1 });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;