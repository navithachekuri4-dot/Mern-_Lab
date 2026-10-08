const jwt = require('jsonwebtoken');

const generateToken = (res, customerId) => {
  const secret = process.env.JWT_SECRET || 'shopkart_secret_key_2026';
  
  const token = jwt.sign({ id: customerId }, secret, {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

module.exports = generateToken;
