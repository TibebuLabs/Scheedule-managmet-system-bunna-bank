const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { rateLimit } = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

router.post("/register", controller.register);
router.post("/login", loginLimiter, controller.login);
router.get("/profile", protect, controller.getProfile);

module.exports = router;
