const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

class AuthService {
  static async createUser(userData) {
    return await User.create(userData);
  }
  
  static async findUserByEmail(email) {
    return await User.findOne({ email });
  }
  
  static async validateUserCredentials(email, password) {
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    return user;
  }
  
  static generateJWT(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  }
  
  static async updateUserLastLogin(userId) {
    return await User.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: true }
    );
  }
}

module.exports = AuthService;
