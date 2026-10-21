import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * Centralized API client with interceptors for:
 * - Automatic token attachment
 * - 401 handling (auto-logout)
 * - Error normalization
 * - Request/response logging
 */

// Resolve base URL from environment, or auto-fallback to Render backend if running on deployed web
export const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // When running on Render or any remote domain (not localhost)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://scheedule-managmet-system-bunna-bank.onrender.com/api';
  }
  return 'http://localhost:5000/api';
};

export const BASE_URL = getBaseURL();

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout to accommodate Render free-tier cold starts
});

/**
 * Request interceptor - Add auth token to all requests
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Attach token if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log('📤 API Request:', {
        method: config.method.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors and normalize responses
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  (error) => {
    // Log error
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });
    
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;
      
      // 401 Unauthorized - Token expired or invalid
      if (status === 401) {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Show appropriate message
        const errorCode = data.code;
        if (errorCode === 'TOKEN_EXPIRED') {
          toast.error('Your session has expired. Please login again.');
        } else if (errorCode === 'INVALID_TOKEN') {
          toast.error('Invalid session. Please login again.');
        } else {
          toast.error('Authentication failed. Please login again.');
        }
        
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
      
      // 403 Forbidden - Account deactivated or insufficient permissions
      else if (status === 403) {
        toast.error(data.message || 'Access denied. Your account may be deactivated.');
      }
      
      // 404 Not Found
      else if (status === 404) {
        toast.error(data.message || 'Resource not found.');
      }
      
      // 429 Too Many Requests - Rate limiting
      else if (status === 429) {
        toast.error('Too many requests. Please try again later.');
      }
      
      // 500+ Server Error
      else if (status >= 500) {
        toast.error('Server error. Please try again later or contact support.');
      }
      
      // Normalize error object for consistent handling
      const normalizedError = {
        success: false,
        message: data.message || 'An error occurred',
        code: data.code || 'UNKNOWN_ERROR',
        errors: data.errors || [],
        status,
      };
      
      return Promise.reject(normalizedError);
    } 
    
    // Network error (no response from server)
    else if (error.request) {
      toast.error('Network error. Please check your connection.');
      
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      });
    } 
    
    // Request setup error
    else {
      toast.error('Request failed. Please try again.');
      
      return Promise.reject({
        success: false,
        message: error.message || 'Request failed',
        code: 'REQUEST_ERROR',
      });
    }
  }
);

/**
 * Helper functions for common HTTP methods
 */

// GET request
export const get = (url, config = {}) => {
  return apiClient.get(url, config);
};

// POST request
export const post = (url, data = {}, config = {}) => {
  return apiClient.post(url, data, config);
};

// PUT request
export const put = (url, data = {}, config = {}) => {
  return apiClient.put(url, data, config);
};

// PATCH request
export const patch = (url, data = {}, config = {}) => {
  return apiClient.patch(url, data, config);
};

// DELETE request
export const del = (url, config = {}) => {
  return apiClient.delete(url, config);
};

/**
 * API service object with all HTTP methods
 */
const api = {
  // Base client (for advanced usage)
  client: apiClient,
  
  // HTTP methods
  get,
  post,
  put,
  patch,
  delete: del,
  
  // Helper to set auth token
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete apiClient.defaults.headers.common['Authorization'];
    }
  },
  
  // Helper to clear auth
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
  },
  
  // Get current base URL
  getBaseURL: () => BASE_URL,
};

export default api;
