const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Product = require("../models/Product");
const sampleProducts = require("../data/seedProducts");

const escapeRegex = (str = "") => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Normalises fields that arrive as strings from multipart/form-data.
const cleanProductBody = (body = {}) => {
  const data = { ...body };
  ["price", "originalPrice", "stock", "steamAppId"].forEach((key) => {
    if (data[key] === "" || data[key] === undefined || data[key] === null) delete data[key];
    else data[key] = Number(data[key]);
  });
  if (typeof data.tags === "string") {
    data.tags = data.tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  if (typeof data.featured === "string") data.featured = data.featured === "true";
  delete data.images; // images are managed through uploads only
  delete data.reviews;
  delete data.rating;
  delete data.numReviews;
  delete data.sold;
  delete data.createdBy;
  return data;
};

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, rating, sort, platform, featured, tag } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const query = {};

    if (search) {
      const rx = { $regex: escapeRegex(search.trim()), $options: "i" };
      query.$or = [{ name: rx }, { brand: rx }, { description: rx }, { tags: rx }];
    }
    if (category) query.category = category;
    if (platform) query.platform = { $regex: escapeRegex(platform), $options: "i" };
    if (tag) query.tags = tag;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && !Number.isNaN(Number(minPrice))) query.price.$gte = Number(minPrice);
      if (maxPrice && !Number.isNaN(Number(maxPrice))) query.price.$lte = Number(maxPrice);
      if (Object.keys(query.price).length === 0) delete query.price;
    }
    if (rating) query.rating = { $gte: Number(rating) };
    if (featured === "true") query.featured = true;

    const sortOptions = {
      newest: { createdAt: -1, _id: -1 },
      "price-asc": { price: 1, _id: 1 },
      "price-desc": { price: -1, _id: 1 },
      rating: { rating: -1, _id: 1 },
      popular: { sold: -1, _id: 1 },
    };
    const sortBy = sortOptions[sort] || sortOptions.newest;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-reviews");

    res.json({
      success: true,
      data: products,
      pagination: { total, page, pages: Math.max(1, Math.ceil(total / limit)), limit },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/categories (public) — product count per category
const getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
    res.json({ success: true, data: categories.map((c) => ({ name: c._id, count: c.count })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "Product not found." });
    const product = await Product.findById(req.params.id).populate("reviews.user", "name avatar");
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products (admin)
const createProduct = async (req, res) => {
  try {
    const data = cleanProductBody(req.body);
    data.images = req.files?.map((f) => `/uploads/${f.filename}`) || [];
    const product = await Product.create({ ...data, createdBy: req.user._id });
    res.status(201).json({ success: true, message: "Product created.", data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id (admin)
const updateProduct = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "Product not found." });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    const data = cleanProductBody(req.body);
    const newImages = req.files?.map((f) => `/uploads/${f.filename}`) || [];
    if (newImages.length > 0) data.images = [...(product.images || []), ...newImages];
    const updated = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ success: true, message: "Product saved.", data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id (admin)
const deleteProduct = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "Product not found." });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    (product.images || []).forEach((img) => {
      if (!img.startsWith("/uploads/")) return; // remote posters are not local files
      const p = path.join(__dirname, "..", img);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products/:id/review
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const stars = Number(rating);
    if (!stars || stars < 1 || stars > 5 || !comment?.trim())
      return res.status(400).json({ success: false, message: "Pick 1–5 stars and write a comment." });
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "Product not found." });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    const already = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ success: false, message: "You have already reviewed this product." });
    product.reviews.push({ user: req.user._id, name: req.user.name, rating: stars, comment: comment.trim() });
    product.calcRating();
    await product.save();
    res.status(201).json({ success: true, message: "Review posted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/stats (admin)
const getStats = async (req, res) => {
  try {
    const total = await Product.countDocuments();
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const lowStock = await Product.countDocuments({ stock: { $gt: 0, $lte: 5 } });
    const categories = await Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
    const topSelling = await Product.find().sort({ sold: -1 }).limit(5).select("name sold price images steamAppId category");
    res.json({ success: true, stats: { total, outOfStock, lowStock, categories, topSelling } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products/seed (admin)
// Adds the sample catalogue. Products that already exist (matched by name) get
// their poster, description and tags refreshed; stock, sales and reviews are kept.
const seedProducts = async (req, res) => {
  try {
    let added = 0;
    let refreshed = 0;
    for (const sample of sampleProducts) {
      const { stock, sold, rating, numReviews, ...catalogue } = sample;
      const result = await Product.updateOne(
        { name: sample.name },
        {
          $set: catalogue,
          $setOnInsert: { stock: stock ?? 20, sold: sold ?? 0, rating: rating ?? 0, numReviews: numReviews ?? 0 },
        },
        { upsert: true, runValidators: true }
      );
      if (result.upsertedCount) added += 1;
      else if (result.matchedCount) refreshed += 1;
    }
    res.json({
      success: true,
      message: `Catalogue ready: ${added} added, ${refreshed} refreshed.`,
      added,
      refreshed,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProducts, getCategories, getProduct, createProduct, updateProduct, deleteProduct, addReview, getStats, seedProducts };
