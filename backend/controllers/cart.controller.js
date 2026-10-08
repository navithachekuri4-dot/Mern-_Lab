const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// ============================================================
// CART CONTROLLER — Lab 5: Shopping Cart
// All functions receive req.user from authMiddleware (set in cart.routes.js)
// ============================================================

// 1. Add a product to cart — POST /cart/:productId
//    - If product already in cart → increase quantity by 1
//    - If product not in cart yet → add it with quantity 1
//    - Quantity can never exceed product's stock
exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Step 1: Validate that productId is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // Step 2: Check the product actually exists in the database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Step 3: Load the authenticated customer's document
    const customer = await Customer.findById(req.user._id);

    // Step 4: Check if this product is already in the cart
    //         cart is an array of { product: ObjectId, quantity: Number }
    //         We compare product._id (ObjectId) as a string to productId (string)
    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Product IS already in cart — increase quantity by 1
      // But first make sure we won't exceed the available stock
      if (existingItem.quantity >= product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} units available in stock.`,
        });
      }
      existingItem.quantity += 1;
    } else {
      // Product is NOT in cart yet — add it with quantity 1
      // Check that at least 1 unit is in stock
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: 'This product is out of stock and cannot be added to cart.',
        });
      }
      customer.cart.push({ product: productId, quantity: 1 });
    }

    // Step 5: Save the updated customer document to MongoDB
    await customer.save();

    return res.status(200).json({
      success: true,
      message: existingItem
        ? 'Cart quantity updated'
        : 'Product added to cart',
      cartCount: customer.cart.length,
    });
  } catch (error) {
    console.error('addToCart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding to cart',
    });
  }
};

// 2. Get the current user's cart — GET /cart
//    - Populates each cart item's product reference with actual product data
//    - Returns: { success, cart: [{ product: {...}, quantity: N }] }
exports.getCart = async (req, res) => {
  try {
    // Use .populate() so each cart item's 'product' field becomes
    // a full product object instead of just an ObjectId
    const customer = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price category image stock description',
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    return res.status(200).json({
      success: true,
      count: customer.cart.length,
      cart: customer.cart, // Each item: { _id, product: {...}, quantity }
    });
  } catch (error) {
    console.error('getCart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching cart',
    });
  }
};

// 3. Update quantity of a cart item — PATCH /cart/:productId
//    Body: { quantity: Number }
//    - quantity must be >= 1
//    - quantity must not exceed product stock
//    - product must already be in the cart
exports.updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Step 1: Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // Step 2: Validate that quantity is provided and is a number >= 1
    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required',
      });
    }

    const parsedQty = Number(quantity);
    if (!Number.isInteger(parsedQty) || parsedQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a whole number and at least 1',
      });
    }

    // Step 3: Verify the product exists and check its stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Step 4: Quantity cannot exceed available stock
    if (parsedQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available. Cannot set quantity to ${parsedQty}.`,
      });
    }

    // Step 5: Find the item in the customer's cart
    const customer = await Customer.findById(req.user._id);
    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in your cart',
      });
    }

    // Step 6: Update the quantity and save
    cartItem.quantity = parsedQty;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated successfully',
    });
  } catch (error) {
    console.error('updateQuantity error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating cart quantity',
    });
  }
};

// 4. Remove a product from cart — DELETE /cart/:productId
//    - Finds the item by productId and removes it
//    - Returns the updated cart count
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Step 1: Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // Step 2: Load the customer document
    const customer = await Customer.findById(req.user._id);

    // Step 3: Check if the product is actually in the cart
    const index = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in your cart',
      });
    }

    // Step 4: Remove the item from the array using splice
    customer.cart.splice(index, 1);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cartCount: customer.cart.length,
    });
  } catch (error) {
    console.error('removeFromCart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing from cart',
    });
  }
};
