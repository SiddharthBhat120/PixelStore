const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

const FREE_SHIPPING_MIN = 999;
const SHIPPING_FEE = 99;

// POST /api/orders
// Prices are read from the database, never trusted from the client.
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress = {}, paymentMethod } = req.body;
    if (!Array.isArray(orderItems) || orderItems.length === 0)
      return res.status(400).json({ success: false, message: "Your cart is empty." });

    const required = ["street", "city", "state", "pincode", "phone"];
    const missing = required.filter((k) => !String(shippingAddress[k] || "").trim());
    if (missing.length)
      return res.status(400).json({ success: false, message: `Add your ${missing.join(", ")} to continue.` });

    const items = [];
    for (const item of orderItems) {
      const quantity = Math.floor(Number(item.quantity));
      if (!mongoose.Types.ObjectId.isValid(item.product) || !quantity || quantity < 1)
        return res.status(400).json({ success: false, message: "One of the cart items is invalid." });
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `${item.name || "A product"} is no longer available.` });
      if (product.stock < quantity)
        return res.status(400).json({ success: false, message: `Only ${product.stock} left of ${product.name}.` });
      items.push({ product: product._id, name: product.name, image: product.images?.[0] || "", price: product.price, quantity });
    }

    // Reserve stock; roll back if another order took the last units first.
    const reserved = [];
    for (const item of items) {
      const ok = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, sold: item.quantity } }
      );
      if (!ok) {
        for (const r of reserved) await Product.findByIdAndUpdate(r.product, { $inc: { stock: r.quantity, sold: -r.quantity } });
        return res.status(400).json({ success: false, message: `${item.name} just sold out. Update your cart and try again.` });
      }
      reserved.push(item);
    }

    const itemsPrice = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const shippingPrice = itemsPrice >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
    const method = paymentMethod === "Online" ? "Online" : "COD";

    const order = await Order.create({
      user: req.user._id,
      orderItems: items,
      shippingAddress: Object.fromEntries(required.map((k) => [k, String(shippingAddress[k]).trim()])),
      paymentMethod: method,
      paymentStatus: method === "Online" ? "Paid" : "Pending",
      itemsPrice,
      shippingPrice,
      totalPrice: itemsPrice + shippingPrice,
    });

    res.status(201).json({ success: true, message: "Order placed.", data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product", "name images")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).json({ success: false, message: "Order not found." });
    const order = await Order.findById(req.params.id).populate("user", "name email").populate("orderItems.product", "name images");
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    if (order.user?._id?.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized." });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { orderStatus: status } : {};
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id/status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const allowed = ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"];
    if (!allowed.includes(orderStatus))
      return res.status(400).json({ success: false, message: "Unknown order status." });
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).json({ success: false, message: "Order not found." });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });

    const wasCancelled = order.orderStatus === "Cancelled";
    const nowCancelled = orderStatus === "Cancelled";
    if (wasCancelled !== nowCancelled) {
      // Cancelling returns items to stock; un-cancelling takes them again.
      const dir = nowCancelled ? 1 : -1;
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: dir * item.quantity, sold: -dir * item.quantity } });
      }
    }

    order.orderStatus = orderStatus;
    if (orderStatus === "Delivered") {
      order.deliveredAt = Date.now();
      order.paymentStatus = "Paid";
    }
    await order.save();
    res.json({ success: true, message: `Order marked ${orderStatus}.`, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/admin/stats
const getOrderStats = async (req, res) => {
  try {
    const total = await Order.countDocuments();
    const revenue = await Order.aggregate([{ $match: { orderStatus: { $ne: "Cancelled" } } }, { $group: { _id: null, total: { $sum: "$totalPrice" } } }]);
    const byStatus = await Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]);
    const recent = await Order.find().populate("user", "name").sort({ createdAt: -1 }).limit(5);

    // Revenue for each of the last 7 days (computed in JS to stay database-agnostic).
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    const week = await Order.find({ createdAt: { $gte: start }, orderStatus: { $ne: "Cancelled" } }).select("createdAt totalPrice");
    const daily = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return { date, revenue: 0, orders: 0 };
    });
    week.forEach((o) => {
      const idx = Math.floor((new Date(o.createdAt) - start) / 86400000);
      if (daily[idx]) {
        daily[idx].revenue += o.totalPrice;
        daily[idx].orders += 1;
      }
    });

    res.json({ success: true, stats: { total, revenue: revenue[0]?.total || 0, byStatus, recent, daily } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getOrderStats };
