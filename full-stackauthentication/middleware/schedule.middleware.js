const Joi = require('joi');
const mongoose = require('mongoose');

// Validate schedule creation data
const validateScheduleData = (req, res, next) => {
  const scheduleSchema = Joi.object({
    scheduleType: Joi.string().valid('daily', 'weekly').required().messages({
      'any.required': 'Schedule type is required',
      'any.only': 'Schedule type must be either "daily" or "weekly"'
    }),
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
    taskDescription: Joi.string().max(1000).optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    estimatedHours: Joi.number().min(0.5).max(24).required().messages({
      'number.min': 'Estimated hours must be at least 0.5',
      'number.max': 'Estimated hours cannot exceed 24',
      'any.required': 'Estimated hours are required'
    }),
    scheduledDate: Joi.date().iso().required().messages({
      'date.iso': 'Scheduled date must be in ISO format',
      'any.required': 'Scheduled date is required'
    }),
    endDate: Joi.date().iso().greater(Joi.ref('scheduledDate')).optional().messages({
      'date.greater': 'End date must be after scheduled date'
    }),
    recurrence: Joi.string().valid('once', 'daily', 'weekly').default('once'),
    recurrenceEndDate: Joi.date().iso().greater(Joi.ref('scheduledDate')).optional(),
    department: Joi.string().max(100).optional(),
    sendEmail: Joi.boolean().default(true),
    notes: Joi.string().max(500).optional(),
    requiredSkills: Joi.array().items(Joi.string().max(50)).optional(),
    location: Joi.string().max(200).optional(),
    enableRotation: Joi.boolean().default(false),
    skipWeekends: Joi.boolean().default(false),
    excludeDates: Joi.array().items(Joi.date().iso()).optional(),
    parentScheduleId: Joi.string().optional()
  });

  const { error } = scheduleSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }
  
  next();
};

// Validate schedule update data
const validateScheduleUpdate = (req, res, next) => {
  const updateSchema = Joi.object({
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    estimatedHours: Joi.number().min(0.5).max(24),
    scheduledDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    status: Joi.string().valid('scheduled', 'in-progress', 'completed', 'cancelled', 'overdue'),
    department: Joi.string().max(100),
    notes: Joi.string().max(500),
    sendEmail: Joi.boolean(),
    location: Joi.string().max(200)
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  });

  const { error } = updateSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: error.details[0].message
    });
  }
  
  next();
};

// Validate ID parameter
const validateIdParam = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid schedule ID format'
    });
  }
  next();
};

// Validate staff ID parameter
const validateStaffIdParam = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.staffId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid staff ID format'
    });
  }
  next();
};

// Validate schedule filters
const validateScheduleFilters = (req, res, next) => {
  const filterSchema = Joi.object({
    scheduleType: Joi.string().valid('daily', 'weekly', 'all'),
    status: Joi.string().valid('scheduled', 'in-progress', 'completed', 'cancelled', 'overdue', 'all'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    date: Joi.date().iso(),
    staffId: Joi.string().custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent', 'all'),
    department: Joi.string().max(100),
    weekNumber: Joi.number().integer().min(1).max(53),
    search: Joi.string().max(100)
  });

  const { error } = filterSchema.validate(req.query, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Filter validation failed',
      errors: errors
    });
  }
  
  next();
};

// Validate bulk schedules
const validateBulkSchedules = (req, res, next) => {
  const bulkSchema = Joi.object({
    schedules: Joi.array().items(
      Joi.object({
        scheduleType: Joi.string().valid('daily', 'weekly').required(),
        taskId: Joi.string().custom((value, helpers) => {
          if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error('any.invalid');
          }
          return value;
        }).required(),
        staffIds: Joi.array().items(
          Joi.string().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
              return helpers.error('any.invalid');
            }
            return value;
          })
        ).min(1).required(),
        estimatedHours: Joi.number().min(0.5).max(24).required(),
        scheduledDate: Joi.date().iso().required(),
        priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
        department: Joi.string().max(100).optional()
      })
    ).min(1).max(50).required()
  });

  const { error } = bulkSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Bulk schedule validation failed',
      error: error.details[0].message
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
    feedback: Joi.string().max(1000).optional()
  });

  const { error } = updateSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Assignment update validation failed',
      error: error.details[0].message
    });
  }
  
  next();
};

module.exports = {
  validateScheduleData,
  validateScheduleUpdate,
  validateIdParam,
  validateStaffIdParam,
  validateScheduleFilters,
  validateBulkSchedules,
  validateAssignmentUpdate
};