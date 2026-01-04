const { body, param, query, validationResult } = require('express-validator');

const validateTaskData = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required 📝')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Status must be pending, in-progress, completed, or cancelled')
];

const validateTaskUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Status must be pending, in-progress, completed, or cancelled')
];

const validateStatusUpdate = [
  body('status')
    .trim()
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Status must be pending, in-progress, completed, or cancelled')
];

const validateIdParam = [
  param('id')
    .isMongoId().withMessage('Invalid task ID format')
];

const validateFilters = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query too long'),
  
  query('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status filter')
];

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }
    
    const errorMessages = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value
    }));
    
    res.status(400).json({
      success: false,
      message: 'Validation failed ❌',
      errors: errorMessages
    });
  };
};

module.exports = {
  validateTaskData,
  validateTaskUpdate,
  validateStatusUpdate,
  validateIdParam,
  validateFilters,
  validate
};