import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StaffTable.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const colors = ['#3d1209', '#5a1b0e', '#8b4513', '#a0522d', '#b85e3a', '#c17b5c'];
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
      case 'active': return 'active';
      case 'on leave': return 'on-leave';
      case 'inactive': return 'inactive';
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
          <div className="loading-spinner" style={{ borderColor: '#3d1209', borderTopColor: '#f59e0b' }}></div>
          <p style={{ color: '#3d1209' }}>Loading staff members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-management" style={{ backgroundColor: '#fdf8f5' }}>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content success" style={{ borderTop: '4px solid #10b981' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #f0e9e5' }}>
              <h3 style={{ color: '#3d1209' }}>✅ {modalContent.title}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#5a1b0e' }}>{modalContent.message}</p>
              {modalContent.details && <p className="modal-details" style={{ color: '#8b4513' }}>{modalContent.details}</p>}
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #f0e9e5' }}>
              <button 
                className="modal-button confirm" 
                onClick={closeModal}
                style={{ backgroundColor: '#3d1209', color: 'white' }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal-content error" style={{ borderTop: '4px solid #dc2626' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #f0e9e5' }}>
              <h3 style={{ color: '#3d1209' }}>❌ {modalContent.title}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#5a1b0e' }}>{modalContent.message}</p>
              {modalContent.details && <p className="modal-details" style={{ color: '#8b4513' }}>{modalContent.details}</p>}
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #f0e9e5' }}>
              <button 
                className="modal-button confirm" 
                onClick={closeModal}
                style={{ backgroundColor: '#3d1209', color: 'white' }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content warning" style={{ borderTop: '4px solid #f59e0b' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #f0e9e5' }}>
              <h3 style={{ color: '#3d1209' }}>⚠️ {modalContent.title}</h3>
              <button className="modal-close" onClick={cancelDelete}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#5a1b0e' }}>{modalContent.message}</p>
              {modalContent.details && <p className="modal-details" style={{ color: '#8b4513' }}>{modalContent.details}</p>}
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #f0e9e5' }}>
              <button 
                className="modal-button cancel" 
                onClick={cancelDelete}
                style={{ backgroundColor: '#e5e7eb', color: '#3d1209' }}
              >
                Cancel
              </button>
              <button 
                className="modal-button delete" 
                onClick={confirmDelete}
                style={{ backgroundColor: '#dc2626', color: 'white' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && staffDetails && (
        <div className="modal-overlay">
          <div className="modal-content info" style={{ borderTop: '4px solid #3d1209' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #f0e9e5' }}>
              <h3 style={{ color: '#3d1209' }}>👤 {modalContent.title}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="staff-details-modal">
                <div 
                  className="staff-avatar-large" 
                  style={{ 
                    backgroundColor: staffDetails.avatarColor,
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(61, 18, 9, 0.2)'
                  }}
                >
                  {staffDetails.firstName.charAt(0)}
                </div>
                <div className="staff-info-list">
                  {modalContent.details.split('\n').map((line, index) => (
                    <div key={index} className="detail-item" style={{ color: '#5a1b0e' }}>
                      {line.trim()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #f0e9e5' }}>
              <button 
                className="modal-button confirm" 
                onClick={closeModal}
                style={{ backgroundColor: '#3d1209', color: 'white' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="staff-header">
        <div className="header-content">
          <h2 style={{ color: '#3d1209' }}>👥 Staff Members</h2>
          <p style={{ color: '#5a1b0e' }}>Manage your team members and their details</p>
          <div className="total-stats" style={{ color: '#8b4513', backgroundColor: '#f0e9e5' }}>
            Total: {staffMembers.length} staff members
          </div>
        </div>
        <button 
          className="add-staff-button" 
          onClick={onAddStaff}
          style={{ 
            background: 'linear-gradient(to right, #3d1209, #5a1b0e)',
            color: 'white'
          }}
        >
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
            style={{ 
              border: '2px solid #e6d7cf',
              borderRadius: '12px',
              color: '#3d1209'
            }}
          />
        </div>
        <div className="filter-buttons">
          {['all', 'active', 'on leave', 'inactive'].map(status => (
            <button
              key={status}
              className={`filter-button ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
              style={{
                backgroundColor: filterStatus === status ? '#3d1209' : 'transparent',
                color: filterStatus === status ? 'white' : '#3d1209',
                borderColor: '#3d1209'
              }}
            >
              {status === 'all' ? 'All Staff' : status}
            </button>
          ))}
        </div>
      </div>

      <div className="staff-table-container" style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(61, 18, 9, 0.1)' }}>
        <div className="table-responsive">
          <table className="staff-table">
            <thead>
              <tr style={{ background: '#f9f5f2' }}>
                <th style={{ color: '#3d1209' }}>Name</th>
                <th style={{ color: '#3d1209' }}>Email</th>
                <th style={{ color: '#3d1209' }}>Role</th>
                <th style={{ color: '#3d1209' }}>Department</th>
                <th style={{ color: '#3d1209' }}>Phone Number</th>
                <th style={{ color: '#3d1209' }}>Status</th>
                <th style={{ color: '#3d1209' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data" style={{ color: '#5a1b0e' }}>
                    {searchQuery ? 'No staff members found matching your search' : 'No staff members found'}
                  </td>
                </tr>
              ) : (
                filteredStaff.map(staff => (
                  <tr key={staff.id} className="staff-row" style={{ borderBottom: '1px solid #f0e9e5' }}>
                    <td>
                      {editingId === staff.id ? (
                        <div className="staff-info editable">
                          <div 
                            className="staff-avatar"
                            style={{ backgroundColor: staff.avatarColor, color: 'white' }}
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
                              style={{ border: '2px solid #e6d7cf', borderRadius: '8px', color: '#3d1209' }}
                            />
                            <input
                              type="text"
                              name="lastName"
                              value={editFormData.lastName}
                              onChange={handleEditFormChange}
                              className="edit-input"
                              placeholder="Last Name"
                              required
                              style={{ border: '2px solid #e6d7cf', borderRadius: '8px', color: '#3d1209' }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="staff-info">
                          <div 
                            className="staff-avatar"
                            style={{ backgroundColor: staff.avatarColor, color: 'white' }}
                          >
                            {staff.firstName.charAt(0)}
                          </div>
                          <div className="staff-details">
                            <div className="staff-name" style={{ color: '#3d1209' }}>{staff.firstName} {staff.lastName}</div>
                            <div className="staff-id" style={{ color: '#8b4513' }}>ID: {staff.employeeId || 'N/A'}</div>
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
                          style={{ border: '2px solid #e6d7cf', borderRadius: '8px', color: '#3d1209' }}
                        />
                      ) : (
                        <div className="staff-email" style={{ color: '#5a1b0e' }}>{staff.email}</div>
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
                          style={{ border: '2px solid #e6d7cf', borderRadius: '8px', color: '#3d1209' }}
                        />
                      ) : (
                        <div className="staff-role" style={{ color: '#5a1b0e' }}>
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
                          style={{ border: '2px solid #e6d7cf', borderRadius: '8px', color: '#3d1209' }}
                        />
                      ) : (
                        <span className="department-badge" style={{ color: '#8b4513' }}>{staff.department}</span>
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
                          style={{ border: '2px solid #e6d7cf', borderRadius: '8px', color: '#3d1209' }}
                        />
                      ) : (
                        <div className="phone-number" style={{ color: '#5a1b0e' }}>
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
                          style={{ border: '2px solid #e6d7cf', borderRadius: '8px', color: '#3d1209' }}
                        >
                          <option value="Active">Active</option>
                          <option value="On Leave">On Leave</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      ) : (
                        <span className={`status-badge ${getStatusColor(staff.status)}`} 
                          style={{
                            backgroundColor: getDisplayStatus(staff.status) === 'active' ? '#10b98120' : 
                                           getDisplayStatus(staff.status) === 'on leave' ? '#f59e0b20' : '#ef444420',
                            color: getDisplayStatus(staff.status) === 'active' ? '#059669' : 
                                   getDisplayStatus(staff.status) === 'on leave' ? '#d97706' : '#dc2626',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontWeight: '500'
                          }}
                        >
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
                              style={{ backgroundColor: '#10b98120', color: '#059669' }}
                            >
                              <span>💾</span>
                            </button>
                            <button 
                              className="action-button cancel" 
                              title="Cancel"
                              onClick={handleCancelClick}
                              style={{ backgroundColor: '#ef444420', color: '#dc2626' }}
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
                              style={{ backgroundColor: '#3d120920', color: '#3d1209' }}
                            >
                              <span>✏️</span>
                            </button>
                            <button 
                              className="action-button delete" 
                              title="Delete"
                              onClick={() => handleDeleteClick(staff.id, `${staff.firstName} ${staff.lastName}`)}
                              style={{ backgroundColor: '#ef444420', color: '#dc2626' }}
                            >
                              <span>🗑️</span>
                            </button>
                            <button 
                              className="action-button view" 
                              title="View Details"
                              onClick={() => handleViewDetails(staff)}
                              style={{ backgroundColor: '#3d120920', color: '#3d1209' }}
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
        <div className="table-stats" style={{ color: '#5a1b0e' }}>
          Showing {filteredStaff.length} of {staffMembers.length} staff members
        </div>
        <div className="table-pagination">
          <button className="pagination-button prev" style={{ color: '#3d1209' }}>← Previous</button>
          <div className="page-numbers">
            <span className="page-number active" style={{ backgroundColor: '#3d1209', color: 'white' }}>1</span>
          </div>
          <button className="pagination-button next" style={{ color: '#3d1209' }}>Next →</button>
        </div>
      </div>

    </div>
  );
};

export default StaffTable;