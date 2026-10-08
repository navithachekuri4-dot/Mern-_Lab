const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.post('/register', customerController.register);
router.post('/login', customerController.login);
router.post('/logout', customerController.logout);

// Protected routes (Require HttpOnly JWT cookie)
router.get('/me', authMiddleware, customerController.getProfile);
router.patch('/change-password', authMiddleware, customerController.changePassword);

module.exports = router;
