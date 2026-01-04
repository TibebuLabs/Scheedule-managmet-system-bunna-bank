import React, { useState } from 'react';
import axios from 'axios';
import './AddStaffForm.css';

const API_BASE_URL = 'http://localhost:5000/api';

const AddStaffForm = ({ onCancel, onStaffAdded, darkMode }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Staff',
    department: 'Customer Service',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_BASE_URL}/staff/add`, formData);
      
      console.log('✅ Employee added:', response.data);
      setSuccess(response.data.message);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'Staff',
        department: 'Customer Service',
        phone: ''
      });
      
      // Notify parent component
      if (onStaffAdded) {
        onStaffAdded(response.data.employee);
      }
      
      // Auto hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Error adding staff:', error);
      
      if (error.response) {
        // Server responded with error
        if (error.response.data.errors) {
          // Validation errors
          const firstError = error.response.data.errors[0];
          setError(`${firstError.field}: ${firstError.message}`);
        } else {
          setError(error.response.data.message || 'Failed to add staff member');
        }
      } else if (error.request) {
        // Request was made but no response
        setError('Network error. Please check if server is running.');
      } else {
        // Something else happened
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check email availability on blur
  const handleEmailBlur = async () => {
    if (!formData.email) return;
    
    try {
      const response = await axios.post(`${API_BASE_URL}/staff/check-email`, {
        email: formData.email
      });
      
      if (!response.data.available) {
        setError('Email already registered. Please use a different email.');
      }
    } catch (error) {
      console.error('Error checking email:', error);
    }
  };

  return (
    <div className="add-staff-form">
      <div className="form-header">
        <h2>👤 Add New Staff Member</h2>
        <p>Fill in the details to add a new team member</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="alert alert-success" style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '15px',
          border: '1px solid #c3e6cb'
        }}>
          ✅ {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-error" style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '15px',
          border: '1px solid #f5c6cb'
        }}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="staff-form">
        <div className="form-grid">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <span className="label-icon">👤</span>
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>
                  <span className="label-icon">👥</span>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <span className="label-icon">📧</span>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  placeholder="staff@bunnabank.com"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>
                  <span className="label-icon">📱</span>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 890"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Employment Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>
                  <span className="label-icon">💼</span>
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="Bank Manager">Bank Manager</option>
                  <option value="Loan Officer">Loan Officer</option>
                  <option value="Teller">Teller</option>
                  <option value="Financial Advisor">Financial Advisor</option>
                  <option value="IT Specialist">IT Specialist</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <span className="label-icon">🏢</span>
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="Management">Management</option>
                  <option value="Loans">Loans</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Investments">Investments</option>
                  <option value="IT Support">IT Support</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <span>⏳ Adding...</span>
            ) : (
              <>
                <span className="submit-icon">➕</span>
                Add Staff Member
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStaffForm;