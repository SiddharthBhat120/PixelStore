const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        image: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ["COD", "Online"], default: "COD" },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    deliveredAt: { type: Date },
    orderId: { type: String, unique: true },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    // Next number after the highest existing id, so deletions never cause duplicates.
    const last = await mongoose.model("Order").findOne({ orderId: /^ORD\d+$/ }).sort({ createdAt: -1 }).select("orderId");
    const next = last ? parseInt(last.orderId.slice(3), 10) + 1 : 1;
    this.orderId = `ORD${String(next).padStart(6, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
