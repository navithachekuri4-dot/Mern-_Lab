const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');     // Lab 5: Shopping Cart
const orderRoutes = require('./routes/order.routes');   // Lab 6: Orders & Checkout

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart';

// Connect to MongoDB with error handling to avoid unhandled process crashes
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(' Connected to MongoDB database (ShopKart)');
  } catch (err) {
    console.error('⚠️  MongoDB connection error:', err.message);
    console.log('💡 Note: Start MongoDB locally or update MONGO_URI in backend/.env');
  }
}

connectDB();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

// Mount customer routes
app.use('/customers', customerRoutes);

// Mount product routes
app.use('/products', productRoutes);

// Mount wishlist routes (Lab 4) — all protected by authMiddleware inside wishlist.routes.js
app.use('/wishlist', wishlistRoutes);

// Mount cart routes (Lab 5) — all protected by authMiddleware inside cart.routes.js
app.use('/cart', cartRoutes);

// Mount order routes (Lab 6) — all protected by authMiddleware inside order.routes.js
app.use('/orders', orderRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ShopKart Authentication API',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections gracefully without crashing
process.on('unhandledRejection', (err) => {
  console.warn('Handled rejection:', err?.message || err);
});

// Handle uncaught exceptions gracefully
process.on('uncaughtException', (err) => {
  console.error('Handled uncaught exception:', err?.message || err);
});

module.exports = app;
