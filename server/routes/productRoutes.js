const express = require("express");
const { getProducts, getCategories, getProduct, createProduct, updateProduct, deleteProduct, addReview, getStats, seedProducts } = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/stats", protect, adminOnly, getStats);
router.post("/seed", protect, adminOnly, seedProducts);
router.get("/:id", getProduct);
router.post("/", protect, adminOnly, upload.array("images", 5), createProduct);
router.put("/:id", protect, adminOnly, upload.array("images", 5), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.post("/:id/review", protect, addReview);

module.exports = router;
