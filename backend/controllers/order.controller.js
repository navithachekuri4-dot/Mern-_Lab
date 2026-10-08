const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const { getRazorpayInstance, getKeyId, getKeySecret } = require('../config/razorpay');

// ============================================================
// ORDER CONTROLLER — Lab 6: Checkout and Orders
// All methods protected by authMiddleware (req.user is populated)
// ============================================================

/**
 * 1. Create Payment Order
 * POST /orders/create-payment-order
 *
 * Flow:
 *  1. Validate shipping address fields from request body.
 *  2. Fetch customer cart from DB (never trust frontend items/totals).
 *  3. Validate cart is not empty.
 *  4. Fetch fresh product data from MongoDB for every item.
 *  5. Check each product still exists and has sufficient stock.
 *  6. Calculate server-side total amount (price * quantity).
 *  7. Build immutable product snapshots (name, price, quantity, image).
 *  8. Save initial Order in MongoDB with status PENDING_PAYMENT / PENDING.
 *  9. Create Razorpay Test Order in paise (amount * 100).
 * 10. Store Razorpay Order ID on MongoDB order.
 * 11. Return safe checkout details (orderId, razorpayOrderId, amount, currency, keyId).
 */
exports.createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // Step 1: Validate Shipping Address
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required.',
      });
    }

    const { fullName, phone, addressLine, city, state, pincode } = shippingAddress;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'All shipping address fields are required and cannot be empty.',
      });
    }

    const cleanPhone = phone.trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits.',
      });
    }

    const cleanPincode = pincode.trim();
    if (!/^\d{6}$/.test(cleanPincode)) {
      return res.status(400).json({
        success: false,
        message: 'Pincode must contain exactly 6 digits.',
      });
    }

    // Step 2 & 3: Load customer cart from DB
    const customer = await Customer.findById(req.user._id);
    if (!customer || !customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items to your cart before checking out.',
      });
    }

    // Step 4, 5, 6 & 7: Fetch latest product data, validate stock, calculate total, create snapshots
    const orderItems = [];
    let calculatedTotal = 0;

    for (const cartItem of customer.cart) {
      // Support both ObjectId reference and populated object format
      const productId = cartItem.product?._id || cartItem.product;

      const product = await Product.findById(productId);

      // Verify product still exists in DB
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'One or more products in your cart are no longer available in our catalog.',
        });
      }

      // Verify stock availability
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, in cart: ${cartItem.quantity}.`,
        });
      }

      // Calculate server-side total
      const itemSubtotal = product.price * cartItem.quantity;
      calculatedTotal += itemSubtotal;

      // Create immutable item snapshot
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });
    }

    if (calculatedTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid total order amount.',
      });
    }

    // Step 8: Create ShopKart Order with PENDING_PAYMENT status
    const shopKartOrder = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: cleanPhone,
        addressLine: addressLine.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: cleanPincode,
      },
      totalAmount: calculatedTotal,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT',
    });

    await shopKartOrder.save();

    // Step 9: Create Razorpay Order
    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(calculatedTotal * 100);

    let razorpayOrder;
    try {
      const razorpay = getRazorpayInstance();
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${shopKartOrder._id}`,
        notes: {
          shopKartOrderId: shopKartOrder._id.toString(),
          customerEmail: customer.email,
        },
      });
    } catch (rzpErr) {
      console.error('Razorpay order creation error:', rzpErr);
      // Clean up orphaned pending order so it doesn't leave lingering draft orders
      await Order.findByIdAndDelete(shopKartOrder._id).catch(() => {});

      const errorDescription =
        rzpErr?.error?.description ||
        rzpErr?.message ||
        'Failed to initialize Razorpay payment';

      return res.status(500).json({
        success: false,
        message: `Razorpay Error: ${errorDescription}. Please verify your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env.`,
      });
    }

    // Step 10: Save Razorpay Order ID on ShopKart order
    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    // Step 11: Return safe checkout information to frontend
    // NEVER expose RAZORPAY_KEY_SECRET!
    return res.status(201).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount, // in paise
      currency: razorpayOrder.currency,
      keyId: getKeyId(),
      customerDetails: {
        name: fullName.trim(),
        email: customer.email,
        phone: cleanPhone,
      },
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Server error while creating payment order.',
    });
  }
};

/**
 * 2. Verify Razorpay Payment Signature
 * POST /orders/verify-payment
 *
 * Flow:
 *  1. Look up ShopKart order by ID.
 *  2. Confirm order belongs to authenticated user.
 *  3. Use trusted Razorpay Order ID saved in DB (NOT blindly from request body).
 *  4. Calculate expected HMAC-SHA256 signature using RAZORPAY_KEY_SECRET.
 *  5. If signature does not match:
 *     - Mark order paymentStatus as FAILED.
 *     - Return 400 with "Invalid payment signature".
 *     - Keep cart intact!
 *  6. If signature matches:
 *     - Mark order as PAID and status as PLACED.
 *     - Store razorpayPaymentId.
 *     - Deduct purchased quantities from product stock.
 *     - Clear backend customer cart.
 *     - Return success with orderId.
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification details.',
      });
    }

    // Step 1: Find ShopKart order
    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format.',
      });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Step 2: Ensure order belongs to authenticated user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to verify this order.',
      });
    }

    // Step 3 & 4: Signature Verification using Node.js crypto
    // Format: order_id + "|" + payment_id
    const trustedOrderId = order.razorpayOrderId || razorpay_order_id;
    const bodyToSign = `${trustedOrderId}|${razorpay_payment_id}`;

    const currentKeySecret = getKeySecret();
    const expectedSignature = crypto
      .createHmac('sha256', currentKeySecret)
      .update(bodyToSign)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      // Step 5: Failed signature verification
      order.paymentStatus = 'FAILED';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification failed.',
      });
    }

    // Step 6: Verified success!
    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Reduce product stock for all purchased items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear backend customer cart ONLY after verified payment
    await Customer.findByIdAndUpdate(req.user._id, {
      $set: { cart: [] },
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order placed successfully!',
      orderId: order._id,
      totalAmount: order.totalAmount,
      status: order.status,
    });
  } catch (error) {
    console.error('verifyPayment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying payment.',
    });
  }
};

/**
 * 3. Get Logged-in User's Orders
 * GET /orders
 *
 * Rules:
 * - Must return ONLY orders belonging to authenticated user.
 * - Sorted newest first (createdAt descending).
 */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('getMyOrders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching your orders.',
    });
  }
};

/**
 * 4. Get Single Order by ID
 * GET /orders/:id
 *
 * Rules:
 * - User must be authenticated.
 * - Order must exist.
 * - Order must belong to authenticated user (IDOR prevention).
 */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format.',
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Ownership check (IDOR Protection)
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this order.',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('getOrderById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching order details.',
    });
  }
};
