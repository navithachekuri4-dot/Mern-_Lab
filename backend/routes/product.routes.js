const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// POST /products — Create a new product (open, no auth required for Lab 3)
router.post('/', productController.createProduct);

// GET /products — Get all products (supports ?search=... and ?category=...)
router.get('/', productController.getAllProducts);

// GET /products/:id — Get a single product by its MongoDB ID
router.get('/:id', productController.getProductById);

module.exports = router;
