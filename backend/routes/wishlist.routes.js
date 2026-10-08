const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// All wishlist routes are protected — authMiddleware verifies JWT cookie and sets req.user

// POST /wishlist/:productId — Add a product to wishlist
router.post("/:productId", authMiddleware, wishlistController.addToWishlist);

// GET /wishlist — Get current user"s wishlist (populated)
router.get("/", authMiddleware, wishlistController.getWishlist);

// DELETE /wishlist/:productId — Remove a product from wishlist
router.delete("/:productId", authMiddleware, wishlistController.removeFromWishlist);

module.exports = router;
