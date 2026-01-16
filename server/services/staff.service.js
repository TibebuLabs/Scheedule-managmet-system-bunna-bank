const Staff = require('../models/Staff.model');

class StaffService {
  async addEmployee(employeeData) {
    try {
      console.log('📝 Creating new employee with data:', employeeData);
      
      const existingEmployee = await Staff.findOne({ 
        email: employeeData.email.toLowerCase().trim() 
      });
      
      if (existingEmployee) {
        throw new Error(`Email ${employeeData.email} is already registered`);
      }
      
      const newEmployee = new Staff({
        firstName: employeeData.firstName.trim(),
        lastName: employeeData.lastName.trim(),
        email: employeeData.email.trim(),
        phone: employeeData.phone ? employeeData.phone.trim() : '',
        role: employeeData.role || 'Staff',
        department: employeeData.department || 'Customer Service',
        status: employeeData.status || 'Active'
      });
      
      await newEmployee.save();
      
      console.log('✅ Employee created:', newEmployee.employeeId);
      
      return {
        success: true,
        message: 'Employee added successfully! 🎉',
        data: {
          id: newEmployee._id,
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
      const employee = await Staff.findOne({ email: email.toLowerCase().trim() });
      
      return {
        exists: !!employee,
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
      
      if (updateData.email) {
        const existingEmployee = await Staff.findOne({
          email: updateData.email.toLowerCase().trim(),
          _id: { $ne: id }
        });
        
        if (existingEmployee) {
          throw new Error(`Email ${updateData.email} is already registered to another employee`);
        }
      }
      
      const updateFields = {};
      
      if (updateData.firstName) updateFields.firstName = updateData.firstName.trim();
      if (updateData.lastName) updateFields.lastName = updateData.lastName.trim();
      if (updateData.email) updateFields.email = updateData.email.trim();
      if (updateData.phone !== undefined) updateFields.phone = updateData.phone ? updateData.phone.trim() : '';
      if (updateData.role) updateFields.role = updateData.role;
      if (updateData.department) updateFields.department = updateData.department;
      if (updateData.status) updateFields.status = updateData.status;
      
      const updatedEmployee = await Staff.findByIdAndUpdate(
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
}

module.exports = new StaffService();