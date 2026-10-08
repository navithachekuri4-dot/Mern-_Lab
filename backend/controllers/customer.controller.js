const bcrypt = require('bcryptjs');
const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');

// 1. Register a new customer
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Validate mandatory fields
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields (fullName, email, password, phone) are required',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check for duplicate email
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create customer in MongoDB
    const newCustomer = await Customer.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
    });

    // Generate JWT and store in HttpOnly cookie
    generateToken(res, newCustomer._id);

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

// 2. Login customer
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password with bcrypt
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT and set HttpOnly cookie
    generateToken(res, customer._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// 3. Get customer profile (Protected)
exports.getProfile = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    return res.status(200).json({
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving profile',
    });
  }
};

// 4. Logout customer
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// 5. Change Password (Bonus - Protected)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as current password',
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, customer.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(newPassword, salt);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating password',
    });
  }
};
