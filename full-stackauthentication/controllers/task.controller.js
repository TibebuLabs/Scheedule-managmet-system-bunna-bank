const taskService = require('../services/task.service');

class TaskController {
  async addTask(req, res) {
    try {
      console.log('📨 Received task data:', req.body);
      
      const result = await taskService.createTask(req.body);
      
      res.status(201).json({
        success: true,
        message: result.message,
        task: result.data,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('🔥 Error in addTask:', error.message);
      
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Task ID already exists',
          field: 'taskId'
        });
      }
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create task. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  async getAllTasks(req, res) {
    try {
      const filters = {
        search: req.query.search,
        status: req.query.status
      };
      
      const result = await taskService.getAllTasks(filters);
      
      res.status(200).json({
        success: true,
        count: result.count,
        tasks: result.data
      });
      
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tasks'
      });
    }
  }
  
  async getTaskById(req, res) {
    try {
      const { id } = req.params;
      
      const result = await taskService.getTaskById(id);
      
      res.status(200).json({
        success: true,
        task: result.data
      });
      
    } catch (error) {
      if (error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch task'
      });
    }
  }
  
  async updateTask(req, res) {
    try {
      const { id } = req.params;
      
      console.log('📝 Update request for task:', id, 'data:', req.body);
      
      const result = await taskService.updateTask(id, req.body);
      
      res.status(200).json({
        success: true,
        message: result.message,
        task: result.data,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('🔥 Error in updateTask:', error.message);
      
      if (error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update task. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  async updateTaskStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      console.log('🔄 Status update request for task:', id, 'to:', status);
      
      const result = await taskService.updateTaskStatus(id, status);
      
      res.status(200).json({
        success: true,
        message: result.message,
        task: result.data,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('🔥 Error in updateTaskStatus:', error.message);
      
      if (error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update task status. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      console.log('🗑️ Delete request for task:', id);
      
      const result = await taskService.deleteTask(id);
      
      res.status(200).json({
        success: true,
        message: result.message,
        deletedTask: result.data,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('🔥 Error in deleteTask:', error.message);
      
      if (error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete task. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  async healthCheck(req, res) {
    res.status(200).json({
      success: true,
      message: 'Task API is running 🚀',
      timestamp: new Date(),
      endpoints: {
        addTask: 'POST /api/tasks/add',
        getAllTasks: 'GET /api/tasks',
        getTask: 'GET /api/tasks/:id',
        updateTask: 'PUT /api/tasks/:id',
        updateStatus: 'PATCH /api/tasks/:id/status',
        deleteTask: 'DELETE /api/tasks/:id'
      }
    });
  }
}

module.exports = new TaskController();