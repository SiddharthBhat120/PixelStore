// server/routes/authRoutes.js
const express = require("express");
const { register, login, getProfile, updateProfile, seedAdmin } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/seed-admin", seedAdmin);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
module.exports = router;
