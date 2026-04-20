// In your AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/auth.service';
import toast from 'react-hot-toast';

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
      
      toast.success('Registration successful! Welcome aboard! 🎉');
      return { ...response, user: normalizedUser };
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      throw error;
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
      
      toast.success(`Welcome back, ${normalizedUser.firstName}! 👋`);
      return { ...response, user: normalizedUser };
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully. See you soon! 👋');
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