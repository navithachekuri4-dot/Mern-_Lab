/**
 * ShopKart Product Seed Script
 * Run: node seedProducts.js
 * Inserts 10 sample products into MongoDB for testing.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart';

const sampleProducts = [
  {
    name: 'Noise Cancelling Headphones',
    description: 'Wireless over-ear headphones with active noise cancellation and 30-hour battery life. Great for music, calls, and working from home.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    stock: 25,
  },
  {
    name: 'Mechanical Keyboard',
    description: 'Compact RGB mechanical keyboard with tactile blue switches. Perfect for programmers and gamers who want satisfying keystrokes.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop',
    stock: 10,
  },
  {
    name: 'Wireless Bluetooth Speaker',
    description: '360-degree surround sound portable speaker. Waterproof, dustproof, and built for outdoor adventures with 12 hours of battery.',
    price: 1799,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop',
    stock: 40,
  },
  {
    name: 'Casual Cotton T-Shirt',
    description: 'Premium 100% organic cotton round-neck T-shirt. Soft, breathable, and available in multiple colours. Perfect for everyday wear.',
    price: 499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
    stock: 120,
  },
  {
    name: 'Running Sneakers',
    description: 'Lightweight running shoes with cushioned sole and breathable mesh upper. Ideal for jogging, gym workouts, and casual wear.',
    price: 1999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    stock: 60,
  },
  {
    name: 'Slim Fit Denim Jacket',
    description: 'Classic indigo denim jacket with a modern slim fit. Features two chest pockets and metal button closure. A wardrobe staple.',
    price: 1299,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&h=300&fit=crop',
    stock: 35,
  },
  {
    name: 'Atomic Habits',
    description: 'Best-selling book by James Clear on building good habits and breaking bad ones. A practical guide backed by science and real-world examples.',
    price: 399,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
    stock: 200,
  },
  {
    name: 'The Pragmatic Programmer',
    description: 'A must-read classic for software developers. Covers timeless techniques and best practices for writing clean, maintainable code.',
    price: 649,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop',
    stock: 80,
  },
  {
    name: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 minimalist ceramic coffee mugs. Microwave and dishwasher safe. 350ml capacity. Elegant matte finish in earthy tones.',
    price: 799,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=300&fit=crop',
    stock: 50,
  },
  {
    name: 'Bamboo Desk Organizer',
    description: 'Eco-friendly bamboo desk organizer with 5 compartments. Holds pens, scissors, sticky notes, and more. Keeps your workspace neat.',
    price: 549,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop',
    stock: 90,
  },
  {
    name: 'USB-C Hub 7-in-1',
    description: '7-port USB-C hub with HDMI 4K, 3x USB-A, SD card reader, microSD reader, and 100W PD charging. Works with laptops and tablets.',
    price: 1499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=300&fit=crop',
    stock: 0,
  },
  {
    name: 'Scented Soy Candles (Pack of 3)',
    description: 'Hand-poured soy wax candles with relaxing lavender, vanilla, and jasmine fragrances. Burns cleanly for up to 40 hours each.',
    price: 699,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1602607671568-dafbc56bcb6a?w=400&h=300&fit=crop',
    stock: 75,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');

    // Remove old products first (clean slate)
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert sample products
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`🌱 Inserted ${inserted.length} sample products successfully`);

    // Display product names for verification
    inserted.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (${p.category}) — ₹${p.price}`);
    });

    console.log('\n✅ Seeding complete! Run: node index.js to start the server.');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seed();
