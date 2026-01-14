import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StaffTable.css';

const API_BASE_URL = 'http://localhost:5000/api';

const StaffTable = ({ onAddStaff, darkMode, refreshTrigger }) => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    details: ''
  });
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [staffDetails, setStaffDetails] = useState(null);

  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/staff/all`);
      
      if (response.data.success) {
        const transformedStaff = response.data.employees.map(employee => ({
          id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          role: employee.role,
          department: employee.department,
          status: employee.status || 'Active',
          avatarColor: getRandomColor(),
          employeeId: employee.employeeId,
          phone: employee.phone || ''
        }));
        
        setStaffMembers(transformedStaff);
      }
    } catch (error) {
      console.error('❌ Error fetching staff:', error);
      setStaffMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const getRandomColor = () => {
    const colors = ['#4A90E2', '#50C878', '#FF6B6B', '#FFA500', '#9B59B6', '#1ABC9C'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    fetchStaffMembers();
  }, [refreshTrigger]);

  const handleEditClick = (staff) => {
    setEditingId(staff.id);
    setEditFormData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      role: staff.role,
      department: staff.department,
      status: staff.status,
      phone: staff.phone || ''
    });
  };

  const handleSaveClick = async (staffId) => {
    try {
      const updateData = {
        firstName: editFormData.firstName.trim(),
        lastName: editFormData.lastName.trim(),
        email: editFormData.email.trim(),
        role: editFormData.role,
        department: editFormData.department,
        status: editFormData.status,
        phone: editFormData.phone ? editFormData.phone.trim() : ''
      };

      const response = await axios.put(`${API_BASE_URL}/staff/${staffId}`, updateData);
      
      setStaffMembers(prev => prev.map(staff => 
        staff.id === staffId 
          ? { 
              ...staff,
              firstName: updateData.firstName,
              lastName: updateData.lastName,
              email: updateData.email,
              role: updateData.role,
              department: updateData.department,
              status: updateData.status,
              phone: updateData.phone
            } 
          : staff
      ));
      
      setEditingId(null);
      setModalContent({
        title: 'Success',
        message: 'Staff updated successfully!',
        details: `${updateData.firstName} ${updateData.lastName} has been updated.`
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('❌ Error updating staff:', error);
      if (error.response?.data?.message) {
        setModalContent({
          title: 'Update Failed',
          message: error.response.data.message,
          details: 'Please check the information and try again.'
        });
      } else {
        setModalContent({
          title: 'Update Failed',
          message: 'Failed to update staff member.',
          details: 'An error occurred while updating. Please try again.'
        });
      }
      setShowErrorModal(true);
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getDisplayStatus = (status) => {
    if (!status) return 'active';
    return status.toLowerCase();
  };

  const filteredStaff = staffMembers.filter(staff => {
    const fullName = `${staff.firstName} ${staff.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (staff.phone && staff.phone.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const displayStatus = getDisplayStatus(staff.status);
    const matchesStatus = filterStatus === 'all' || displayStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const displayStatus = getDisplayStatus(status);
    switch (displayStatus) {
      case 'active': return 'success';
      case 'on leave': return 'warning';
      case 'inactive': return 'danger';
      default: return 'secondary';
    }
  };

  const handleDeleteClick = (staffId, staffName) => {
    setStaffToDelete({ id: staffId, name: staffName });
    setModalContent({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete ${staffName}?`,
      details: 'This action cannot be undone.'
    });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (staffToDelete) {
      try {
        await axios.delete(`${API_BASE_URL}/staff/${staffToDelete.id}`);
        fetchStaffMembers();
        setModalContent({
          title: 'Success',
          message: 'Staff member deleted successfully!',
          details: `${staffToDelete.name} has been removed from the system.`
        });
        setShowSuccessModal(true);
      } catch (error) {
        console.error('❌ Error deleting staff:', error);
        setModalContent({
          title: 'Deletion Failed',
          message: 'Failed to delete staff member',
          details: 'Please try again or contact support if the issue persists.'
        });
        setShowErrorModal(true);
      } finally {
        setStaffToDelete(null);
        setShowDeleteModal(false);
      }
    }
  };

  const cancelDelete = () => {
    setStaffToDelete(null);
    setShowDeleteModal(false);
  };

  const handleViewDetails = (staff) => {
    setStaffDetails(staff);
    setModalContent({
      title: 'Staff Details',
      message: `${staff.firstName} ${staff.lastName}`,
      details: `
        Email: ${staff.email}
        Role: ${staff.role}
        Department: ${staff.department}
        Phone: ${formatPhoneNumber(staff.phone)}
        Status: ${staff.status}
        Employee ID: ${staff.employeeId || 'N/A'}
      `
    });
    setShowDetailsModal(true);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone || phone === '') return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const closeModal = () => {
    setShowSuccessModal(false);
    setShowErrorModal(false);
    setShowDeleteModal(false);
    setShowDetailsModal(false);
    setModalContent({ title: '', message: '', details: '' });
    setStaffDetails(null);
  };

  if (loading) {
    return (
      <div className="staff-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading staff members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-management">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content success">
            <div className="modal-header">
              <h3>✅ {modalContent.title}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p>{modalContent.message}</p>
              {modalContent.details && <p className="modal-details">{modalContent.details}</p>}
            </div>
            <div className="modal-footer">
              <button className="modal-button confirm" onClick={closeModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal-content error">
            <div className="modal-header">
              <h3>❌ {modalContent.title}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p>{modalContent.message}</p>
              {modalContent.details && <p className="modal-details">{modalContent.details}</p>}
            </div>
            <div className="modal-footer">
              <button className="modal-button confirm" onClick={closeModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content warning">
            <div className="modal-header">
              <h3>⚠️ {modalContent.title}</h3>
              <button className="modal-close" onClick={cancelDelete}>×</button>
            </div>
            <div className="modal-body">
              <p>{modalContent.message}</p>
              {modalContent.details && <p className="modal-details">{modalContent.details}</p>}
            </div>
            <div className="modal-footer">
              <button className="modal-button cancel" onClick={cancelDelete}>Cancel</button>
              <button className="modal-button delete" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && staffDetails && (
        <div className="modal-overlay">
          <div className="modal-content info">
            <div className="modal-header">
              <h3>👤 {modalContent.title}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="staff-details-modal">
                <div className="staff-avatar-large" style={{ backgroundColor: staffDetails.avatarColor }}>
                  {staffDetails.firstName.charAt(0)}
                </div>
                <div className="staff-info-list">
                  {modalContent.details.split('\n').map((line, index) => (
                    <div key={index} className="detail-item">
                      {line.trim()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-button confirm" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="staff-header">
        <div className="header-content">
          <h2>👥 Staff Members</h2>
          <p>Manage your team members and their details</p>
          <div className="total-stats">
            Total: {staffMembers.length} staff members
          </div>
        </div>
        <button className="add-staff-button" onClick={onAddStaff}>
          <span className="plus-icon">+</span>
          <span>Add Staff</span>
        </button>
      </div>

      <div className="staff-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search staff by name, email, role, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-buttons">
          {['all', 'active', 'on leave', 'inactive'].map(status => (
            <button
              key={status}
              className={`filter-button ${filterStatus === status ? 'active' : ''} ${getStatusColor(status)}`}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? 'All Staff' : status}
            </button>
          ))}
        </div>
      </div>

      <div className="staff-table-container">
        <div className="table-responsive">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Phone Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    {searchQuery ? 'No staff members found matching your search' : 'No staff members found'}
                  </td>
                </tr>
              ) : (
                filteredStaff.map(staff => (
                  <tr key={staff.id} className="staff-row">
                    <td>
                      {editingId === staff.id ? (
                        <div className="staff-info editable">
                          <div 
                            className="staff-avatar"
                            style={{ backgroundColor: staff.avatarColor }}
                          >
                            {staff.firstName.charAt(0)}
                          </div>
                          <div className="staff-details">
                            <input
                              type="text"
                              name="firstName"
                              value={editFormData.firstName}
                              onChange={handleEditFormChange}
                              className="edit-input"
                              placeholder="First Name"
                              required
                            />
                            <input
                              type="text"
                              name="lastName"
                              value={editFormData.lastName}
                              onChange={handleEditFormChange}
                              className="edit-input"
                              placeholder="Last Name"
                              required
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="staff-info">
                          <div 
                            className="staff-avatar"
                            style={{ backgroundColor: staff.avatarColor }}
                          >
                            {staff.firstName.charAt(0)}
                          </div>
                          <div className="staff-details">
                            <div className="staff-name">{staff.firstName} {staff.lastName}</div>
                            <div className="staff-id">ID: {staff.employeeId || 'N/A'}</div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === staff.id ? (
                        <input
                          type="email"
                          name="email"
                          value={editFormData.email}
                          onChange={handleEditFormChange}
                          className="edit-input"
                          placeholder="Email"
                          required
                        />
                      ) : (
                        <div className="staff-email">{staff.email}</div>
                      )}
                    </td>
                    <td>
                      {editingId === staff.id ? (
                        <input
                          type="text"
                          name="role"
                          value={editFormData.role}
                          onChange={handleEditFormChange}
                          className="edit-input"
                          placeholder="Role"
                          required
                        />
                      ) : (
                        <div className="staff-role">
                          <span className="role-icon">💼</span>
                          {staff.role}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === staff.id ? (
                        <input
                          type="text"
                          name="department"
                          value={editFormData.department}
                          onChange={handleEditFormChange}
                          className="edit-input"
                          placeholder="Department"
                          required
                        />
                      ) : (
                        <span className="department-badge">{staff.department}</span>
                      )}
                    </td>
                    <td>
                      {editingId === staff.id ? (
                        <input
                          type="tel"
                          name="phone"
                          value={editFormData.phone}
                          onChange={handleEditFormChange}
                          className="edit-input"
                          placeholder="Phone Number"
                        />
                      ) : (
                        <div className="phone-number">
                          <span className="phone-icon">📱</span>
                          {formatPhoneNumber(staff.phone)}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === staff.id ? (
                        <select
                          name="status"
                          value={editFormData.status}
                          onChange={handleEditFormChange}
                          className="status-select"
                        >
                          <option value="Active">Active</option>
                          <option value="On Leave">On Leave</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      ) : (
                        <span className={`status-badge ${getStatusColor(staff.status)}`}>
                          {getDisplayStatus(staff.status)}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {editingId === staff.id ? (
                          <>
                            <button 
                              className="action-button save" 
                              title="Save Changes"
                              onClick={() => handleSaveClick(staff.id)}
                            >
                              <span>💾</span>
                            </button>
                            <button 
                              className="action-button cancel" 
                              title="Cancel"
                              onClick={handleCancelClick}
                            >
                              <span>❌</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              className="action-button edit" 
                              title="Edit"
                              onClick={() => handleEditClick(staff)}
                            >
                              <span>✏️</span>
                            </button>
                            <button 
                              className="action-button delete" 
                              title="Delete"
                              onClick={() => handleDeleteClick(staff.id, `${staff.firstName} ${staff.lastName}`)}
                            >
                              <span>🗑️</span>
                            </button>
                            <button 
                              className="action-button view" 
                              title="View Details"
                              onClick={() => handleViewDetails(staff)}
                            >
                              <span>👁️</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-footer">
        <div className="table-stats">
          Showing {filteredStaff.length} of {staffMembers.length} staff members
        </div>
        <div className="table-pagination">
          <button className="pagination-button prev">← Previous</button>
          <div className="page-numbers">
            <span className="page-number active">1</span>
          </div>
          <button className="pagination-button next">Next →</button>
        </div>
      </div>
    </div>
  );
};

export default StaffTable;