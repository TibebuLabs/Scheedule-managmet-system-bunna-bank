const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

// Check JWT_SECRET on startup
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.log('🔐 WARNING: JWT_SECRET is too short or using default value');
  console.log('   For security, use a strong random string (minimum 32 characters)');
  console.log('   Generate one at: https://generate-random.org/api-key-generator');
}

const generateToken = (id) => {
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  return {
    token: jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn }),
    expiresIn
  };
};

const register = async (req, res) => {
  try {
    console.log('📝 Registration attempt for:', req.body.email);
    
    const { firstName, lastName, email, phone, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      console.log('❌ Phone already exists:', phone);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this phone number'
      });
    }
    
    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password
    });
    
    console.log('✅ User created:', user.email);
    
    // Generate token
    const tokenData = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! 🎉',
      token: tokenData.token,
      expiresIn: tokenData.expiresIn,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('🔥 Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        code: 'DUPLICATE_FIELD',
        field: field
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      code: 'REGISTRATION_ERROR'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt:', email);
    
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
        code: 'MISSING_CREDENTIALS'
      });
    }
    
    // Check if user exists and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }
    
    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);
    
    if (!isPasswordMatch) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
    // Generate token
    const tokenData = generateToken(user._id);
    
    console.log('✅ Login successful:', email);
    
    res.status(200).json({
      success: true,
      message: 'Login successful! ✅',
      token: tokenData.token,
      expiresIn: tokenData.expiresIn,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        lastLogin: user.lastLogin
      }
    });
    
  } catch (error) {
    console.error('🔥 Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      code: 'LOGIN_ERROR'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('🔥 Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};