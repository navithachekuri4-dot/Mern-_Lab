const Product = require('../models/product.model');
const mongoose = require('mongoose');

// 1. Create a new product — POST /products
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Validate all required fields are present
    if (!name || !description || !price || !category || !image || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, description, price, category, image, stock',
      });
    }

    // Validate price is greater than 0
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a number greater than 0',
      });
    }

    // Validate stock is not negative
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a number of 0 or more',
      });
    }

    // Save product to MongoDB
    const newProduct = await Product.create({ name, description, price, category, image, stock });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error) {
    // Mongoose validation errors (e.g. min value violations)
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error while creating product',
    });
  }
};

// 2. Get all products with optional search and category filter — GET /products
exports.getAllProducts = async (req, res) => {
  try {
    // Read query parameters from the URL (e.g. ?search=keyboard&category=Electronics)
    const { search, category } = req.query;

    // Build the MongoDB filter object dynamically
    const filter = {};

    // If search is provided, match product names that contain the search term (case-insensitive)
    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    // If category is provided, filter by exact category name (case-insensitive)
    if (category && category.trim() && category.trim().toLowerCase() !== 'all') {
      filter.category = { $regex: `^${category.trim()}$`, $options: 'i' };
    }

    // Query MongoDB with the filter
    const products = await Product.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
    });
  }
};

// 3. Get a single product by ID — GET /products/:id
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // Look up the product in MongoDB
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
    });
  }
};
