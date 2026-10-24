const express = require("express");
const { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getOrderStats } = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/auth");
const router = express.Router();

router.use(protect);
router.post("/", createOrder);
router.get("/my", getMyOrders);
router.get("/admin/all", adminOnly, getAllOrders);
router.get("/admin/stats", adminOnly, getOrderStats);
router.get("/:id", getOrder);
router.put("/:id/status", adminOnly, updateOrderStatus);

module.exports = router;
