const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Product name is required"], trim: true },
    description: { type: String, required: [true, "Description is required"] },
    price: { type: Number, required: [true, "Price is required"], min: 0 },
    originalPrice: { type: Number, default: 0 },
    category: {
      type: String,
      required: true,
      enum: ["Games", "Controllers", "Headsets", "Keyboards", "Mice", "Monitors", "GPUs", "Consoles", "Accessories", "Gift Cards"],
    },
    brand: { type: String, required: true, trim: true },
    images: [{ type: String }],
    stock: { type: Number, required: true, default: 0, min: 0 },
    sold: { type: Number, default: 0 },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    tags: [{ type: String }],
    platform: { type: String, default: "" }, // PC, PS5, Xbox, etc.
    steamAppId: { type: Number }, // used by the client to build poster/banner URLs
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Recalculate rating on save
productSchema.methods.calcRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.rating = this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
};

module.exports = mongoose.model("Product", productSchema);
