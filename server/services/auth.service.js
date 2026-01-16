const User = require("../models/User.model");
const jwt = require("jsonwebtoken");

class AuthService {
  static async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    return await User.create(userData);
  }

  static async login(email, password) {
    const user = await User.findOne({ email }).select("+password");

    if (!user) return null;
    if (!user.isActive) throw new Error("User is inactive");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return null;

    user.lastLogin = new Date();
    await user.save();

    return user;
  }

  static generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });
  }
}

module.exports = AuthService;
