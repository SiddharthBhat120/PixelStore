const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));

app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "🎮 PixelStore API running!", time: new Date() })
);

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found." }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || "Server error." });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\nPixelStore Server running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
    console.log(`Seed admin: POST http://localhost:${PORT}/api/auth/seed-admin`);
    console.log(`Seed products: POST http://localhost:${PORT}/api/products/seed\n`);
  });
};

startServer();
