const Joi = require('joi');

/**
 * Joi validation schemas for authentication routes
 * Replaces inline validation for consistent error handling
 */

// Validation schema for user registration
const registerSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),
  
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    }),
  
  email: Joi.string()
    .trim()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{9,15}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please enter a valid phone number (9-15 digits)',
      'any.required': 'Phone number is required'
    }),
  
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your password'
    }),
  
  department: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow(''),
  
  role: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow('')
});

// Validation schema for user login
const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'any.required': 'Password is required'
    })
});

// Validation middleware wrapper
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: false // Allow all fields
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));
      
      // Log validation error for debugging
      console.log('❌ Validation Error:', {
        timestamp: new Date().toISOString(),
        endpoint: 'auth/register',
        errors,
        receivedData: req.body
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed - please check the form fields',
        code: 'VALIDATION_ERROR',
        errors: errors
      });
    }
    
    // Replace req.body with validated data
    req.body = value;
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  validate
};
