const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { 
  validateTaskData, 
  validateTaskUpdate, 
  validateStatusUpdate,
  validateIdParam, 
  validateFilters,
  validate 
} = require('../middleware/task.middleware');

// Health check
router.get('/health', taskController.healthCheck);

// Add new task
router.post('/add', validate(validateTaskData), taskController.addTask);

// Get all tasks (with optional filters)
router.get('/', validate(validateFilters), taskController.getAllTasks);

// Get single task by ID
router.get('/:id', validate(validateIdParam), taskController.getTaskById);

// Update task by ID
router.put('/:id', validate(validateIdParam), validate(validateTaskUpdate), taskController.updateTask);

// Update only task status
router.patch('/:id/status', validate(validateIdParam), validate(validateStatusUpdate), taskController.updateTaskStatus);

// Delete task by ID
router.delete('/:id', validate(validateIdParam), taskController.deleteTask);

module.exports = router;