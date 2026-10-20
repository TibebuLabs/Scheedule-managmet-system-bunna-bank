import api from './api';

// Helper function to normalize user object
const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    _id: user._id || user.id,
    id: user._id || user.id
  };
};

const authService = {
 async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.token) {
        api.setAuthToken(response.data.token);
        
        // Normalize user data before storing
        const normalizedUser = normalizeUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        
        return {
          ...response.data,
          user: normalizedUser
        };
      }
      return response.data;
    } catch (error) {
      // Error is already handled by API interceptor
      // Just re-throw for component-level handling
      throw error;
    }
  },

  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.token) {
        api.setAuthToken(response.data.token);
        
        // Normalize user data before storing
        const normalizedUser = normalizeUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        
        return {
          ...response.data,
          user: normalizedUser
        };
      }
      return response.data;
    } catch (error) {
      // Error is already handled by API interceptor
      throw error;
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      const normalizedUser = normalizeUser(response.data.user);
      return { user: normalizedUser };
    } catch (error) {
      throw error;
    }
  },

  logout() {
    api.clearAuth();
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    return normalizeUser(user);
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  // Helper method to update user in localStorage
  updateUser(updates) {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  }
};

export default authService;