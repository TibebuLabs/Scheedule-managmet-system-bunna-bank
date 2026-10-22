// In your AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/auth.service';
import toast from 'react-hot-toast';
import { Smile } from 'lucide-react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        // Normalize user object to use _id
        const normalizedUser = {
          ...currentUser,
          _id: currentUser._id || currentUser.id
        };
        setUser(normalizedUser);
      }
    }
    setLoading(false);
  }, []);

  const normalizeUser = (userData) => {
    return {
      ...userData,
      _id: userData._id || userData.id
    };
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      const normalizedUser = normalizeUser(response.user);
      setUser(normalizedUser);
      
      // Update localStorage with normalized user
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      toast.success('Registration successful! Welcome aboard!');
      return { ...response, user: normalizedUser };
    } catch (error) {
      // Don't show toast here - API interceptor already handled it
      // Just pass error message if available
      const errorMessage = error.message || 'Registration failed';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      const normalizedUser = normalizeUser(response.user);
      setUser(normalizedUser);
      
      // Update localStorage with normalized user
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      toast.success(<span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}>Welcome back, {normalizedUser.firstName}! <Smile size={16} /></span>);
      return { ...response, user: normalizedUser };
    } catch (error) {
      // Don't show toast here - API interceptor already handled it
      const errorMessage = error.message || 'Login failed';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success(<span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}>Logged out successfully. See you soon! <Smile size={16} /></span>);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};