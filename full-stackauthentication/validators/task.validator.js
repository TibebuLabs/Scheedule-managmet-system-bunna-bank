const Joi = require('joi');
const mongoose = require('mongoose');

/**
 * Joi validation schemas for task routes
 * Replaces express-validator for consistent validation across all endpoints
 */

// Validation schema for task creation
const taskCreateSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Task title is required 📝',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Task title is required'
    }),
  
  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  status: Joi.string()
    .valid('pending', 'in-progress', 'completed', 'cancelled')
    .default('pending')
    .messages({
      'any.only': 'Status must be pending, in-progress, completed, or cancelled'
    }),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .default('medium')
    .optional(),
  
  assignedTo: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow(''),
  
  deadline: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Deadline must be a valid date'
    }),
  
  category: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow(''),
  
  tags: Joi.array()
    .items(Joi.string().max(50))
    .optional()
});

// Validation schema for task update
const taskUpdateSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  
  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  status: Joi.string()
    .valid('pending', 'in-progress', 'completed', 'cancelled')
    .optional()
    .messages({
      'any.only': 'Status must be pending, in-progress, completed, or cancelled'
    }),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .optional(),
  
  assignedTo: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow(''),
  
  deadline: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Deadline must be a valid date'
    }),
  
  category: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow(''),
  
  tags: Joi.array()
    .items(Joi.string().max(50))
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Validation schema for status update only
const taskStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'in-progress', 'completed', 'cancelled')
    .required()
    .messages({
      'string.empty': 'Status is required',
      'any.only': 'Status must be pending, in-progress, completed, or cancelled',
      'any.required': 'Status is required'
    })
});

// Validation for MongoDB ObjectId parameters
const idParamSchema = Joi.object({
  id: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .required()
    .messages({
      'any.invalid': 'Invalid task ID format',
      'any.required': 'Task ID is required'
    })
});

// Validation for query filters
const taskFiltersSchema = Joi.object({
  search: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Search query too long'
    }),
  
  status: Joi.string()
    .valid('pending', 'in-progress', 'completed', 'cancelled')
    .optional()
    .messages({
      'any.only': 'Invalid status filter'
    }),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .optional(),
  
  category: Joi.string()
    .trim()
    .max(100)
    .optional(),
  
  assignedTo: Joi.string()
    .trim()
    .max(200)
    .optional(),
  
  page: Joi.number()
    .integer()
    .min(1)
    .optional(),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
});

// Validation middleware wrapper
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed ❌',
        code: 'VALIDATION_ERROR',
        errors: errors
      });
    }
    
    // Replace req[source] with validated and sanitized data
    req[source] = value;
    next();
  };
};

module.exports = {
  taskCreateSchema,
  taskUpdateSchema,
  taskStatusSchema,
  idParamSchema,
  taskFiltersSchema,
  validate
};
