const AuthService = require("../services/auth.service");

const register = async (req, res, next) => {
  try {
    const user = await AuthService.register(req.body);
    const token = AuthService.generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });

    const user = await AuthService.login(email, password);

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = AuthService.generateToken(user._id);

    res.json({ success: true, token, user });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

const getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, getProfile };
