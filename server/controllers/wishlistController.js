const mongoose = require("mongoose");
const User = require("../models/User");

// POST /api/wishlist/toggle/:productId
const toggleWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!mongoose.Types.ObjectId.isValid(productId))
      return res.status(400).json({ success: false, message: "Unknown product." });
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.indexOf(productId);
    if (idx === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(idx, 1);
    }
    await user.save();
    res.json({ success: true, wishlist: user.wishlist, added: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist", "name price originalPrice images rating category brand platform stock steamAppId");
    res.json({ success: true, data: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { toggleWishlist, getWishlist };
