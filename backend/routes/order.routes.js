const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All order endpoints are protected by authMiddleware
// req.user is guaranteed to be set for all routes

// 1. Initiate checkout and create Razorpay test order
router.post('/create-payment-order', authMiddleware, orderController.createPaymentOrder);

// 2. Verify Razorpay payment signature and complete order
router.post('/verify-payment', authMiddleware, orderController.verifyPayment);

// 3. Get all orders placed by currently logged-in user
router.get('/', authMiddleware, orderController.getMyOrders);

// 4. Get a specific order by ID (with ownership check)
router.get('/:id', authMiddleware, orderController.getOrderById);

module.exports = router;
