const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { validateEmployeeData, validateEmployeeUpdate, validate } = require('../middleware/staff.middleware');

router.get('/health', staffController.healthCheck);

router.post(
  '/add',
  validate(validateEmployeeData),
  staffController.addEmployee
);

router.post('/check-email', staffController.checkEmail);

router.get('/all', staffController.getAllEmployees);

router.get('/:id', staffController.getEmployeeById);

router.put(
  '/:id',
  validate(validateEmployeeUpdate),
  staffController.updateEmployee
);

router.delete('/:id', staffController.deleteEmployee);

router.patch('/:id/soft-delete', staffController.softDeleteEmployee);

module.exports = router;