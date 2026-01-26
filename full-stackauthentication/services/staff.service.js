const Staff = require('../models/Staff.model');

class StaffService {
  async addEmployee(employeeData) {
    try {
      console.log('📝 Creating new employee with data:', employeeData);
      
      // Clean and validate data
      const cleanedData = {
        firstName: employeeData.firstName ? employeeData.firstName.trim() : '',
        lastName: employeeData.lastName ? employeeData.lastName.trim() : '',
        email: employeeData.email ? employeeData.email.toLowerCase().trim() : '',
        phone: employeeData.phone ? employeeData.phone.trim() : '',
        role: employeeData.role || 'Staff',
        department: employeeData.department || 'IT Infrastructure', // Changed to match model
        status: employeeData.status || 'Active'
      };
      
      // Validate required fields
      if (!cleanedData.firstName) {
        throw new Error('First name is required');
      }
      if (!cleanedData.lastName) {
        throw new Error('Last name is required');
      }
      if (!cleanedData.email) {
        throw new Error('Email is required');
      }
      if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(cleanedData.email)) {
        throw new Error('Please enter a valid email');
      }
      
      // Check for existing email
      const existingEmployee = await Staff.findOne({ 
        email: cleanedData.email 
      });
      
      if (existingEmployee) {
        throw new Error(`Email ${cleanedData.email} is already registered`);
      }
      
      // Validate role against enum
      const validRoles = ['Junior IT Officer', 'IT Officer', 'Senior IT Officer', 'developer', 'Database Admin', 'Staff'];
      if (!validRoles.includes(cleanedData.role)) {
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }
      
      // Validate department against enum
      const validDepartments = ['IT Infrastructure', 'core banking', 'Mobile application and development', 'digital channal', 'HR'];
      if (!validDepartments.includes(cleanedData.department)) {
        throw new Error(`Invalid department. Must be one of: ${validDepartments.join(', ')}`);
      }
      
      // Validate phone format if provided
      if (cleanedData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(cleanedData.phone)) {
        throw new Error('Please enter a valid phone number (at least 10 digits)');
      }
      
      // Create new employee
      const newEmployee = new Staff(cleanedData);
      
      await newEmployee.save();
      
      console.log('✅ Employee created:', newEmployee.employeeId);
      
      return {
        success: true,
        message: 'Employee added successfully! 🎉',
        employee: {
          _id: newEmployee._id,
          employeeId: newEmployee.employeeId,
          firstName: newEmployee.firstName,
          lastName: newEmployee.lastName,
          email: newEmployee.email,
          role: newEmployee.role,
          department: newEmployee.department,
          status: newEmployee.status,
          phone: newEmployee.phone,
          hireDate: newEmployee.hireDate,
          createdAt: newEmployee.createdAt
        }
      };
    } catch (error) {
      console.error('❌ Error adding employee:', error.message);
      throw error;
    }
  }
  
  async getAllEmployees() {
    try {
      const employees = await Staff.find()
        .sort({ createdAt: -1 })
        .select('firstName lastName email role department status phone employeeId hireDate createdAt updatedAt');
      
      return {
        success: true,
        count: employees.length,
        data: employees
      };
    } catch (error) {
      console.error('❌ Error fetching employees:', error);
      throw error;
    }
  }
  
  async checkEmailExists(email) {
    try {
      const cleanedEmail = email ? email.toLowerCase().trim() : '';
      
      if (!cleanedEmail) {
        return {
          available: false,
          message: 'Email is required'
        };
      }
      
      if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(cleanedEmail)) {
        return {
          available: false,
          message: 'Invalid email format'
        };
      }
      
      const employee = await Staff.findOne({ email: cleanedEmail });
      
      return {
        available: !employee,
        message: employee ? 'Email already registered' : 'Email is available'
      };
    } catch (error) {
      console.error('❌ Error checking email:', error);
      throw error;
    }
  }
  
  async getEmployeeById(id) {
    try {
      const employee = await Staff.findById(id);
      
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      return {
        success: true,
        data: employee
      };
    } catch (error) {
      console.error('❌ Error fetching employee:', error);
      throw error;
    }
  }
  
  async updateEmployee(id, updateData) {
    try {
      console.log('🔄 Updating employee:', id, 'with data:', updateData);
      
      // Clean and prepare update data
      const cleanedUpdateData = {};
      
      if (updateData.firstName) cleanedUpdateData.firstName = updateData.firstName.trim();
      if (updateData.lastName) cleanedUpdateData.lastName = updateData.lastName.trim();
      if (updateData.email) cleanedUpdateData.email = updateData.email.toLowerCase().trim();
      if (updateData.phone !== undefined) cleanedUpdateData.phone = updateData.phone ? updateData.phone.trim() : '';
      if (updateData.role) cleanedUpdateData.role = updateData.role;
      if (updateData.department) cleanedUpdateData.department = updateData.department;
      if (updateData.status) cleanedUpdateData.status = updateData.status;
      
      // Check email uniqueness if being updated
      if (cleanedUpdateData.email) {
        const existingEmployee = await Staff.findOne({
          email: cleanedUpdateData.email,
          _id: { $ne: id }
        });
        
        if (existingEmployee) {
          throw new Error(`Email ${cleanedUpdateData.email} is already registered to another employee`);
        }
      }
      
      const updatedEmployee = await Staff.findByIdAndUpdate(
        id,
        { 
          ...cleanedUpdateData,
          updatedAt: Date.now()
        },
        { 
          new: true,
          runValidators: true
        }
      );
      
      if (!updatedEmployee) {
        throw new Error('Employee not found');
      }
      
      console.log('✅ Employee updated:', updatedEmployee.employeeId);
      
      return {
        success: true,
        message: 'Employee updated successfully! ✨',
        data: {
          id: updatedEmployee._id,
          employeeId: updatedEmployee.employeeId,
          firstName: updatedEmployee.firstName,
          lastName: updatedEmployee.lastName,
          email: updatedEmployee.email,
          role: updatedEmployee.role,
          department: updatedEmployee.department,
          status: updatedEmployee.status,
          phone: updatedEmployee.phone,
          updatedAt: updatedEmployee.updatedAt
        }
      };
    } catch (error) {
      console.error('❌ Error updating employee:', error.message);
      throw error;
    }
  }
  
  async deleteEmployee(id) {
    try {
      console.log('🗑️ Deleting employee:', id);
      
      const deletedEmployee = await Staff.findByIdAndDelete(id);
      
      if (!deletedEmployee) {
        throw new Error('Employee not found');
      }
      
      console.log('✅ Employee deleted:', deletedEmployee.employeeId);
      
      return {
        success: true,
        message: 'Employee deleted successfully! 🗑️',
        data: {
          id: deletedEmployee._id,
          employeeId: deletedEmployee.employeeId,
          fullName: `${deletedEmployee.firstName} ${deletedEmployee.lastName}`,
          email: deletedEmployee.email
        }
      };
    } catch (error) {
      console.error('❌ Error deleting employee:', error.message);
      throw error;
    }
  }
  
  async softDeleteEmployee(id) {
    try {
      console.log('⚠️ Soft deleting employee:', id);
      
      const employee = await Staff.findByIdAndUpdate(
        id,
        { 
          status: 'Inactive',
          updatedAt: Date.now()
        },
        { new: true }
      );
      
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      console.log('✅ Employee soft deleted:', employee.employeeId);
      
      return {
        success: true,
        message: 'Employee marked as inactive successfully! ⚠️',
        data: {
          id: employee._id,
          employeeId: employee.employeeId,
          fullName: `${employee.firstName} ${employee.lastName}`,
          status: employee.status
        }
      };
    } catch (error) {
      console.error('❌ Error soft deleting employee:', error.message);
      throw error;
    }
  }
  
  async getStats() {
    try {
      const totalEmployees = await Staff.countDocuments();
      const activeEmployees = await Staff.countDocuments({ status: 'Active' });
      const inactiveEmployees = await Staff.countDocuments({ status: 'Inactive' });
      const onLeaveEmployees = await Staff.countDocuments({ status: 'On Leave' });
      
      // Get department-wise distribution
      const departments = await Staff.aggregate([
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      // Get role-wise distribution
      const roles = await Staff.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      // Get recent hires (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentHires = await Staff.countDocuments({
        hireDate: { $gte: thirtyDaysAgo }
      });
      
      return {
        success: true,
        stats: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
          onLeave: onLeaveEmployees,
          departments: departments,
          roles: roles,
          recentHires: recentHires
        }
      };
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      throw error;
    }
  }
}

module.exports = new StaffService();