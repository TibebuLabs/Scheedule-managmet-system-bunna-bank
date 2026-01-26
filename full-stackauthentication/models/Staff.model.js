const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    default: '',
    match: [/^(\+251|0)(9|7)[0-9]{8}$/, 'Please enter a valid Ethiopian phone number (+251XXXXXXXXX or 0XXXXXXXXX)']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['Junior IT Officer', 'IT Officer', 'Senior IT Officer', 'developer', 'Database Admin', 'Staff'],
    default: 'Staff'
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['IT Infrastructure', 'core banking', 'Mobile application and development', 'digital channal', 'HR'],
    default: 'IT Infrastructure'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave'],
    default: 'Active'
  },
  employeeId: {
    type: String,
    unique: true
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

staffSchema.pre('save', function(next) {
  if (!this.employeeId) {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.employeeId = `EMP${year}${randomNum}`;
  }
  
  // Format phone number to standard Ethiopian format
  if (this.phone) {
    this.phone = this.phone.trim();
    // Convert 0XXXXXXXXX to +251XXXXXXXXX
    if (this.phone.startsWith('0') && this.phone.length === 10) {
      this.phone = '+251' + this.phone.substring(1);
    }
  }
  
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  
  this.updatedAt = Date.now();
  next();
});

staffSchema.index({ email: 1 }, { unique: true });
staffSchema.index({ employeeId: 1 }, { unique: true });
staffSchema.index({ department: 1 });

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;