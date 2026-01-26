const { body, validationResult } = require('express-validator');

const validateEmployeeData = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required 👤')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required 👥')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required 📧')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+251|0)(9|7)[0-9]{8}$/).withMessage('Please enter a valid Ethiopian phone number (+251XXXXXXXXX or 0XXXXXXXXX) 📱'),
  
  body('role')
    .isIn(['Junior IT Officer', 'IT Officer', 'Senior IT Officer', 'developer', 'Database Admin', 'Staff'])
    .withMessage('Please select a valid role 💼'),
  
  body('department')
    .isIn(['IT Infrastructure', 'core banking', 'Mobile application and development', 'digital channal', 'HR'])
    .withMessage('Please select a valid department 🏢'),
  
  body('status')
    .optional()
    .isIn(['Active', 'Inactive', 'On Leave'])
    .withMessage('Please select a valid status 📊')
];

const validateEmployeeUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+251|0)(9|7)[0-9]{8}$/).withMessage('Please enter a valid Ethiopian phone number (+251XXXXXXXXX or 0XXXXXXXXX) 📱'),
  
  body('role')
    .optional()
    .isIn(['Junior IT Officer', 'IT Officer', 'Senior IT Officer', 'developer', 'Database Admin', 'Staff'])
    .withMessage('Please select a valid role 💼'),
  
  body('department')
    .optional()
    .isIn(['IT Infrastructure', 'core banking', 'Mobile application and development', 'digital channal', 'HR'])
    .withMessage('Please select a valid department 🏢'),
  
  body('status')
    .optional()
    .isIn(['Active', 'Inactive', 'On Leave'])
    .withMessage('Please select a valid status 📊')
];

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }
    
    const errorMessages = errors.array().map(err => ({
      path: err.param,
      msg: err.msg,
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
  validateEmployeeData,
  validateEmployeeUpdate,
  validate
};