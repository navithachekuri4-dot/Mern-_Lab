const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All cart routes are protected — authMiddleware verifies the JWT cookie and sets req.user

// POST /cart/:productId — Add a product to the cart (or increase quantity if already in cart)
router.post('/:productId', authMiddleware, cartController.addToCart);

// GET /cart — Get the current user's full cart (populated with product details)
router.get('/', authMiddleware, cartController.getCart);

// PATCH /cart/:productId — Update the quantity of a specific cart item
//   Body: { quantity: Number }
router.patch('/:productId', authMiddleware, cartController.updateQuantity);

// DELETE /cart/:productId — Remove a specific product from the cart
router.delete('/:productId', authMiddleware, cartController.removeFromCart);

module.exports = router;
