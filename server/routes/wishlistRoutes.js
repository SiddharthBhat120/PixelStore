const express = require("express");
const { toggleWishlist, getWishlist } = require("../controllers/wishlistController");
const { protect } = require("../middleware/auth");
const router = express.Router();
router.use(protect);
router.get("/", getWishlist);
router.post("/toggle/:productId", toggleWishlist);
module.exports = router;
