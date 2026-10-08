const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// 1. Add a product to the wishlist — POST /wishlist/:productId
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const customer = await Customer.findById(req.user._id);
    const alreadyInWishlist = customer.wishlist.some((id) => id.toString() === productId);
    if (alreadyInWishlist) {
      return res.status(409).json({ success: false, message: "Product is already in your wishlist" });
    }
    customer.wishlist.push(productId);
    await customer.save();
    return res.status(200).json({ success: true, message: "Product added to wishlist" });
  } catch (error) {
    console.error("addToWishlist error:", error);
    return res.status(500).json({ success: false, message: "Server error while adding to wishlist" });
  }
};

// 2. Get the current user's wishlist — GET /wishlist
exports.getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock description",
    });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error("getWishlist error:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching wishlist" });
  }
};

// 3. Remove a product from wishlist — DELETE /wishlist/:productId
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    const customer = await Customer.findById(req.user._id);
    const index = customer.wishlist.findIndex((id) => id.toString() === productId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Product not found in your wishlist" });
    }
    customer.wishlist.splice(index, 1);
    await customer.save();
    return res.status(200).json({ success: true, message: "Product removed from wishlist" });
  } catch (error) {
    console.error("removeFromWishlist error:", error);
    return res.status(500).json({ success: false, message: "Server error while removing from wishlist" });
  }
};
