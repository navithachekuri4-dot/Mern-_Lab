const mongoose = require('mongoose');

/**
 * Order Item Sub-schema
 * IMPORTANT (Lab 6 Concept):
 * We store an immutable SNAPSHOT of product details (name, price, image)
 * at the exact moment of order creation.
 * If the product price or name changes tomorrow in the database,
 * this past order will still display the original purchased price and details.
 */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    name: {
      type: String,
      required: [true, 'Product name snapshot is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price snapshot is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    image: {
      type: String,
      required: [true, 'Product image snapshot is required'],
    },
  },
  { _id: true }
);

/**
 * Shipping Address Sub-schema
 */
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    addressLine: {
      type: String,
      required: [true, 'Address line is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
    },
  },
  { _id: false }
);

/**
 * Main Order Schema (Lab 6)
 */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order items are required'],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: 'An order must contain at least one item',
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, 'Shipping address is required'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'],
      default: 'PENDING_PAYMENT',
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
