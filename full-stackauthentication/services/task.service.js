const Task = require('../models/Task.model');

class TaskService {
  async createTask(taskData) {
    try {
      console.log('📝 Creating new task with data:', taskData);
      
      const newTask = new Task({
        title: taskData.title.trim(),
        description: taskData.description ? taskData.description.trim() : '',
        status: taskData.status || 'pending'
      });
      
      await newTask.save();
      
      console.log('✅ Task created:', newTask.taskId);
      
      return {
        success: true,
        message: 'Task created successfully! 🎉',
        data: {
          id: newTask._id,
          taskId: newTask.taskId,
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          createdAt: newTask.createdAt,
          updatedAt: newTask.updatedAt
        }
      };
    } catch (error) {
      console.error('❌ Error creating task:', error.message);
      throw error;
    }
  }
  
  async getAllTasks(filters = {}) {
    try {
      let query = {};
      
      if (filters.status && filters.status !== 'all') {
        query.status = filters.status;
      }
      
      if (filters.search) {
        query.title = { $regex: filters.search, $options: 'i' };
      }
      
      const tasks = await Task.find(query).sort({ createdAt: -1 });
      
      return {
        success: true,
        count: tasks.length,
        data: tasks
      };
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      throw error;
    }
  }
  
  async getTaskById(id) {
    try {
      const task = await Task.findById(id);
      
      if (!task) {
        throw new Error('Task not found');
      }
      
      return {
        success: true,
        data: task
      };
    } catch (error) {
      console.error('❌ Error fetching task:', error);
      throw error;
    }
  }
  
  async updateTask(id, updateData) {
    try {
      console.log('🔄 Updating task:', id, 'with data:', updateData);
      
      const updateFields = {};
      
      if (updateData.title) updateFields.title = updateData.title.trim();
      if (updateData.description !== undefined) {
        updateFields.description = updateData.description.trim();
      }
      if (updateData.status) updateFields.status = updateData.status;
      
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { 
          ...updateFields,
          updatedAt: Date.now()
        },
        { 
          new: true,
          runValidators: true
        }
      );
      
      if (!updatedTask) {
        throw new Error('Task not found');
      }
      
      console.log('✅ Task updated:', updatedTask.taskId);
      
      return {
        success: true,
        message: 'Task updated successfully! ✨',
        data: updatedTask
      };
    } catch (error) {
      console.error('❌ Error updating task:', error.message);
      throw error;
    }
  }
  
  async updateTaskStatus(id, status) {
    try {
      console.log('🔄 Updating task status:', id, 'to:', status);
      
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { 
          status: status,
          updatedAt: Date.now()
        },
        { 
          new: true,
          runValidators: true
        }
      );
      
      if (!updatedTask) {
        throw new Error('Task not found');
      }
      
      console.log('✅ Task status updated:', updatedTask.taskId);
      
      return {
        success: true,
        message: 'Task status updated successfully! ✅',
        data: updatedTask
      };
    } catch (error) {
      console.error('❌ Error updating task status:', error.message);
      throw error;
    }
  }
  
  async deleteTask(id) {
    try {
      console.log('🗑️ Deleting task:', id);
      
      const deletedTask = await Task.findByIdAndDelete(id);
      
      if (!deletedTask) {
        throw new Error('Task not found');
      }
      
      console.log('✅ Task deleted:', deletedTask.taskId);
      
      return {
        success: true,
        message: 'Task deleted successfully! 🗑️',
        data: {
          id: deletedTask._id,
          taskId: deletedTask.taskId,
          title: deletedTask.title
        }
      };
    } catch (error) {
      console.error('❌ Error deleting task:', error.message);
      throw error;
    }
  }
}

module.exports = new TaskService();