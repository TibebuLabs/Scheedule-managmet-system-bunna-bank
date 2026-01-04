import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to normalize user object
const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    _id: user._id || user.id,
    id: user._id || user.id
  };
};

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const authService = {
 async register(userData) {
    try {
      console.log('📤 Sending registration data to API:', JSON.stringify(userData, null, 2));
      
      const response = await api.post('/register', userData);
      
      console.log('✅ Registration successful:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
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
      console.error('❌ Registration API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      const errorData = error.response?.data || { 
        message: 'Registration failed. Please try again.' 
      };
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        if (errorData.field === 'email') {
          errorData.message = 'Email already exists. Please use a different email.';
        } else if (errorData.message === 'All fields are required') {
          errorData.message = 'Please fill in all required fields correctly.';
        }
      }
      
      throw errorData;
    }
  },

  async login(credentials) {
    try {
      const response = await api.post('/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
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
      const errorData = error.response?.data || { message: 'Login failed' };
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        errorData.message = 'Invalid email or password. Please try again.';
      }
      
      throw errorData;
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/profile');
      const normalizedUser = normalizeUser(response.data.user);
      return { user: normalizedUser };
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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