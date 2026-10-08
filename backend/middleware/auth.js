const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'shopkart-super-secret-key-2026';

function requireAuth(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access unauthorized. Please log in to your ShopKart account.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const customer = db.findById(decoded.id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or session has expired.'
      });
    }

    // Exclude passwordHash before passing along
    const { passwordHash, ...safeCustomer } = customer;
    req.customer = safeCustomer;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Your session has expired or the token is invalid. Please log in again.'
    });
  }
}

module.exports = {
  requireAuth,
  JWT_SECRET
};
