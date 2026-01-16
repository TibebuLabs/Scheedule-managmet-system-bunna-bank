const Joi = require('joi');
const mongoose = require('mongoose');

// Validate daily schedule creation data
const validateDailyScheduleData = (req, res, next) => {
  const dailyScheduleSchema = Joi.object({
    scheduleType: Joi.string().valid('daily', 'weekly').default('daily'),
    taskId: Joi.string().custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).required().messages({
      'any.required': 'Task ID is required',
      'any.invalid': 'Invalid task ID format'
    }),
    staffIds: Joi.array().items(
      Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
    ).min(1).required().messages({
      'array.min': 'At least one staff member is required',
      'any.required': 'Staff IDs are required'
    }),
    
    // ✅ FIX: ADDED THESE TWO REQUIRED FIELDS
    taskTitle: Joi.string().max(200).required().messages({
      'string.max': 'Task title cannot exceed 200 characters',
      'any.required': 'Task title is required'
    }),
    
    taskCategory: Joi.string().max(50).default('general'),
    
    taskDescription: Joi.string().max(2000).optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    estimatedHours: Joi.number().min(0.5).max(24).default(8).messages({
      'number.min': 'Estimated hours must be at least 0.5',
      'number.max': 'Estimated hours cannot exceed 24 for daily schedules',
      'any.required': 'Estimated hours are required'
    }),
    scheduledDate: Joi.date().iso().required().messages({
      'date.iso': 'Scheduled date must be in ISO format',
      'any.required': 'Scheduled date is required'
    }),
    startDate: Joi.date().iso().optional(), // For weekly schedules
    endDate: Joi.date().iso().optional(), // For weekly schedules
    timeSlot: Joi.string().valid('morning', 'afternoon', 'full-day', 'custom').default('full-day'),
    customStartTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().messages({
      'string.pattern.base': 'Start time must be in HH:MM format (24-hour)'
    }),
    customEndTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().messages({
      'string.pattern.base': 'End time must be in HH:MM format (24-hour)'
    }),
    recurrence: Joi.string().valid('once', 'daily', 'weekdays', 'weekly').default('once'),
    recurrenceEndDate: Joi.date().iso().greater(Joi.ref('scheduledDate')).optional().messages({
      'date.greater': 'Recurrence end date must be after scheduled date'
    }),
    department: Joi.string().max(100).optional(),
    location: Joi.string().max(200).optional().default('Office'),
    sendEmail: Joi.boolean().default(true),
    checkAvailability: Joi.boolean().default(true),
    strictAvailability: Joi.boolean().default(false),
    notes: Joi.string().max(1000).optional(),
    requiredTools: Joi.array().items(Joi.string().max(50)).optional(),
    overtimeApproved: Joi.boolean().default(false),
    isHoliday: Joi.boolean().default(false),
    enableRotation: Joi.boolean().default(false),
    skipWeekends: Joi.boolean().default(true)
  });

  const { error } = dailyScheduleSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      type: detail.type
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Daily schedule validation failed',
      errors: errors,
      code: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

// Validate daily schedule update data
const validateDailyScheduleUpdate = (req, res, next) => {
  const updateSchema = Joi.object({
    taskTitle: Joi.string().max(200), // ✅ ADDED
    taskCategory: Joi.string().max(50), // ✅ ADDED
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    estimatedHours: Joi.number().min(0.5).max(24),
    scheduledDate: Joi.date().iso(),
    timeSlot: Joi.string().valid('morning', 'afternoon', 'full-day', 'custom'),
    customStartTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    customEndTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    status: Joi.string().valid('scheduled', 'in-progress', 'completed', 'cancelled'),
    department: Joi.string().max(100),
    location: Joi.string().max(200),
    notes: Joi.string().max(1000),
    sendEmail: Joi.boolean(),
    overtimeApproved: Joi.boolean(),
    taskDescription: Joi.string().max(2000),
    requiredTools: Joi.array().items(Joi.string().max(50)),
    isHoliday: Joi.boolean(),
    assignments: Joi.array().items(
      Joi.object({
        staffId: Joi.string().custom((value, helpers) => {
          if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error('any.invalid');
          }
          return value;
        }),
        staffName: Joi.string(),
        email: Joi.string().email(),
        status: Joi.string().valid('pending', 'in-progress', 'completed', 'overdue', 'cancelled'),
        startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        notes: Joi.string().max(500),
        hoursWorked: Joi.number().min(0).max(24),
        rating: Joi.number().min(1).max(5)
      })
    )
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  });

  const { error } = updateSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Daily schedule update validation failed',
      error: error.details[0].message,
      code: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

// Validate ID parameter
const validateIdParam = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid daily schedule ID format',
      code: 'INVALID_ID_FORMAT'
    });
  }
  next();
};

// Validate staff ID parameter
const validateStaffIdParam = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.staffId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid staff ID format',
      code: 'INVALID_ID_FORMAT'
    });
  }
  next();
};

// Validate daily schedule filters
const validateDailyScheduleFilters = (req, res, next) => {
  const filterSchema = Joi.object({
    date: Joi.date().iso(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    staffId: Joi.string().custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    status: Joi.string().valid('scheduled', 'in-progress', 'completed', 'cancelled', 'all'),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent', 'all'),
    department: Joi.string().max(100),
    taskCategory: Joi.string().max(50),
    timeSlot: Joi.string().valid('morning', 'afternoon', 'full-day', 'custom', 'all'),
    search: Joi.string().max(100),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  });

  const { error } = filterSchema.validate(req.query, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Daily schedule filter validation failed',
      errors: errors,
      code: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

// Validate assignment update
const validateAssignmentUpdate = (req, res, next) => {
  const updateSchema = Joi.object({
    status: Joi.string().valid('pending', 'in-progress', 'completed', 'overdue', 'cancelled').required(),
    notes: Joi.string().max(500).optional(),
    hoursWorked: Joi.number().min(0).max(24).optional(),
    rating: Joi.number().min(1).max(5).optional(),
    feedback: Joi.string().max(1000).optional(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
  });

  const { error } = updateSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Assignment update validation failed',
      error: error.details[0].message,
      code: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

module.exports = {
  validateDailyScheduleData,
  validateDailyScheduleUpdate,
  validateIdParam,
  validateStaffIdParam,
  validateDailyScheduleFilters,
  validateAssignmentUpdate
};