const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { 
  taskCreateSchema,
  taskUpdateSchema,
  taskStatusSchema,
  idParamSchema,
  taskFiltersSchema,
  validate 
} = require('../validators/task.validator');

// Health check
router.get('/health', taskController.healthCheck);

// Add new task
router.post('/add', validate(taskCreateSchema, 'body'), taskController.addTask);

// Get all tasks (with optional filters)
router.get('/', validate(taskFiltersSchema, 'query'), taskController.getAllTasks);

// Get single task by ID
router.get('/:id', validate(idParamSchema, 'params'), taskController.getTaskById);

// Update task by ID
router.put('/:id', 
  validate(idParamSchema, 'params'), 
  validate(taskUpdateSchema, 'body'), 
  taskController.updateTask
);

// Update only task status
router.patch('/:id/status', 
  validate(idParamSchema, 'params'), 
  validate(taskStatusSchema, 'body'), 
  taskController.updateTaskStatus
);

// Delete task by ID
router.delete('/:id', validate(idParamSchema, 'params'), taskController.deleteTask);

module.exports = router;