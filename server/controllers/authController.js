const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: "All fields required." });
  if (password.length < 6)
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
  try {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ success: false, message: "Email already registered." });
    const user = await User.create({ name, email, password });
    res.status(201).json({
      success: true,
      message: "Account created!",
      token: generateToken(user._id),
      user: user.toPublicJSON(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email and password required." });
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    res.json({
      success: true,
      message: "Login successful!",
      token: generateToken(user._id),
      user: user.toPublicJSON(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/profile
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist", "name price images");
  res.json({ success: true, user: user.toPublicJSON() });
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, address },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: "Profile updated!", user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/seed-admin
const seedAdmin = async (req, res) => {
  try {
    const exists = await User.findOne({ email: "admin@pixelstore.com" });
    if (exists) return res.json({ success: true, message: "Admin exists.", credentials: { email: "admin@pixelstore.com", password: "admin123" } });
    await User.create({ name: "Pixel Admin", email: "admin@pixelstore.com", password: "admin123", role: "admin" });
    res.json({ success: true, message: "Admin created!", credentials: { email: "admin@pixelstore.com", password: "admin123" } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, seedAdmin };
