const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Access token is missing',
      });
    }

    const secret = process.env.JWT_SECRET || 'shopkart_secret_key_2026';
    const decoded = jwt.verify(token, secret);

    const customer = await Customer.findById(decoded.id).select('-password');
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer account not found',
      });
    }

    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired session token',
    });
  }
};

module.exports = authMiddleware;
