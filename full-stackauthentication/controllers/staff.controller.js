const staffService = require('../services/staff.service');

class StaffController {
  async addEmployee(req, res) {
    try {
      console.log('📨 Received employee data:', req.body);
      
      const result = await staffService.addEmployee(req.body);
      
      res.status(201).json({
        success: true,
        message: result.message,
        employee: result.data,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('🔥 Error in addEmployee:', error.message);
      
      if (error.message.includes('Email') && error.message.includes('already')) {
        return res.status(409).json({
          success: false,
          message: error.message,
          field: 'email'
        });
      }
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(409).json({
          success: false,
          message: `${field} already exists`,
          field: field
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
        message: 'Failed to add employee. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  async getAllEmployees(req, res) {
    try {
      const result = await staffService.getAllEmployees();
      
      res.status(200).json({
        success: true,
        count: result.count,
        employees: result.data
      });
      
    } catch (error) {
      console.error('❌ Error fetching employees:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employees'
      });
    }
  }
  
  async checkEmail(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }
      
      const result = await staffService.checkEmailExists(email);
      
      res.status(200).json({
        success: true,
        available: !result.exists,
        message: result.message
      });
      
    } catch (error) {
      console.error('❌ Error checking email:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to check email'
      });
    }
  }
  
  async getEmployeeById(req, res) {
    try {
      const { id } = req.params;
      
      const result = await staffService.getEmployeeById(id);
      
      res.status(200).json({
        success: true,
        employee: result.data
      });
      
    } catch (error) {
      if (error.message === 'Employee not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employee'
      });
    }
  }
  
  async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      console.log('📝 Update request for employee:', id, 'data:', req.body);
      
      const result = await staffService.updateEmployee(id, req.body);
      
      res.status(200).json({
        success: true,
        message: result.message,
        employee: result.data,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('🔥 Error in updateEmployee:', error.message);
      
      if (error.message === 'Employee not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('Email') && error.message.includes('already')) {
        return res.status(409).json({
          success: false,
          message: error.message,
          field: 'email'
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
        message: 'Failed to update employee. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  async deleteEmployee(req, res) {
    try {
      const { id } = req.params;
      console.log('🗑️ Delete request for employee:', id);
      
      const result = await staffService.deleteEmployee(id);
      
      res.status(200).json({
        success: true,
        message: result.message,
        deletedEmployee: result.data,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('🔥 Error in deleteEmployee:', error.message);
      
      if (error.message === 'Employee not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete employee. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  async softDeleteEmployee(req, res) {
    try {
      const { id } = req.params;
      console.log('⚠️ Soft delete request for employee:', id);
      
      const result = await staffService.softDeleteEmployee(id);
      
      res.status(200).json({
        success: true,
        message: result.message,
        employee: result.data,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('🔥 Error in softDeleteEmployee:', error.message);
      
      if (error.message === 'Employee not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to soft delete employee. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  async healthCheck(req, res) {
    res.status(200).json({
      success: true,
      message: 'Staff API is running 🚀',
      timestamp: new Date(),
      endpoints: {
        addEmployee: 'POST /api/staff/add',
        getAllEmployees: 'GET /api/staff/all',
        checkEmail: 'POST /api/staff/check-email',
        getEmployee: 'GET /api/staff/:id',
        updateEmployee: 'PUT /api/staff/:id',
        deleteEmployee: 'DELETE /api/staff/:id',
        softDeleteEmployee: 'PATCH /api/staff/:id/soft-delete'
      }
    });
  }
}

module.exports = new StaffController();