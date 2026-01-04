const { body, validationResult } = require('express-validator');

const validateEmployeeData = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required 👤')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
    .matches(/^[A-Za-z\s]+$/).withMessage('First name can only contain letters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required 👥')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
    .matches(/^[A-Za-z\s]+$/).withMessage('Last name can only contain letters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required 📧')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\+\-\(\)]{10,}$/).withMessage('Please enter a valid phone number 📱'),
  
  body('role')
    .isIn(['Bank Manager', 'Loan Officer', 'Teller', 'Financial Advisor', 'IT Specialist', 'Staff'])
    .withMessage('Please select a valid role 💼'),
  
  body('department')
    .isIn(['Management', 'Loans', 'Customer Service', 'Investments', 'IT Support'])
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
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
    .matches(/^[A-Za-z\s]+$/).withMessage('First name can only contain letters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
    .matches(/^[A-Za-z\s]+$/).withMessage('Last name can only contain letters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\+\-\(\)]{10,}$/).withMessage('Please enter a valid phone number 📱'),
  
  body('role')
    .optional()
    .isIn(['Bank Manager', 'Loan Officer', 'Teller', 'Financial Advisor', 'IT Specialist', 'Staff'])
    .withMessage('Please select a valid role 💼'),
  
  body('department')
    .optional()
    .isIn(['Management', 'Loans', 'Customer Service', 'Investments', 'IT Support'])
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
  validateEmployeeData,
  validateEmployeeUpdate,
  validate
};