const path = require('path');
const Razorpay = require('razorpay');

// Explicitly load backend/.env using absolute path resolution
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * Razorpay Configuration
 * - Reads RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET directly from backend/.env.
 * - Always trims keys to avoid whitespace issues.
 * - RAZORPAY_KEY_SECRET is kept strictly on the backend and NEVER exposed to frontend.
 */
function getKeyId() {
  return (process.env.RAZORPAY_KEY_ID || '').trim();
}

function getKeySecret() {
  return (process.env.RAZORPAY_KEY_SECRET || '').trim();
}

function getRazorpayInstance() {
  return new Razorpay({
    key_id: getKeyId(),
    key_secret: getKeySecret(),
  });
}

module.exports = {
  getRazorpayInstance,
  getKeyId,
  getKeySecret,
};
