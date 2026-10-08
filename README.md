# 🛒 MERN Lab – ShopKart

A full-stack e-commerce web application built as part of the MERN Lab series, developed progressively from **Lab 1 to Lab 6**.

The project covers user authentication, product management, wishlist, cart management, global state management, checkout, Razorpay Test Mode payments, and order management.

---

## 🚀 Features

### 🔐 Authentication
- User registration
- User login
- JWT-based authentication
- Protected routes
- Logout functionality
- User profile
- Change password
- Authentication using HTTP-only cookies

### 🛍️ Product Catalog
- View all products
- Product details
- Product images
- Product price and stock information
- Product filtering
- Product search
- MongoDB-based product data

### ❤️ Wishlist
- Add products to wishlist
- Remove products from wishlist
- View wishlist
- Protected wishlist APIs

### 🛒 Shopping Cart
- Add products to cart
- Update product quantity
- Remove products from cart
- Cart count in Navbar
- Server-side cart persistence
- Global cart state using React Context

### 💳 Checkout & Payments
- Checkout page
- Shipping address form
- Server-side price calculation
- Stock validation
- Razorpay Test Mode integration
- Razorpay order creation
- Payment signature verification
- Payment status persistence
- Cart cleared only after successful payment verification

### 📦 Orders
- Create orders
- View user's orders
- View individual order details
- Order status tracking
- Payment status tracking
- Product price snapshots
- Shipping address snapshots
- Protected order APIs

---

## 🧪 Lab Progress

### Lab 1 – Project Setup & Basic Web Application

The initial lab established the foundation of the ShopKart application.

- Frontend setup
- Backend setup
- Basic application structure
- Initial pages and components
- API communication
- Basic e-commerce UI

### Lab 2 – Authentication

Implemented user authentication and protected pages.

- Registration
- Login
- JWT authentication
- HTTP-only cookies
- Protected `/home` route
- Fetch authenticated user using `/customers/me`
- Logout
- Authentication error handling

### Lab 3 – Product Catalog

Implemented the product catalog using MongoDB.

- Product model
- Product controller
- Product routes
- Product seeding
- Product listing
- Product filtering
- Product details
- Stock information
- Responsive product UI

### Lab 4 – Wishlist

Implemented wishlist functionality.

- Add product to wishlist
- Remove product from wishlist
- View wishlist
- Protected wishlist APIs
- MongoDB persistence

### Lab 5 – Cart & State Management

Implemented shopping cart functionality and frontend state management.

- Add to cart
- Update quantity
- Remove from cart
- Cart count
- Global cart state
- `CartContext`
- `refreshCart()`
- `clearCart()`
- Server-side cart persistence
- Cart and Navbar synchronization

### Lab 6 – Checkout, Razorpay & Orders

Implemented the complete checkout and payment workflow.

#### Checkout Flow


Cart
  ↓
Checkout
  ↓
Shipping Details
  ↓
Server-side Cart & Stock Validation
  ↓
Create Pending ShopKart Order
  ↓
Create Razorpay Test Order
  ↓
Razorpay Checkout
  ↓
Payment
  ↓
Server-side Signature Verification
  ↓
Mark Order as PAID / PLACED
  ↓
Clear Cart
  ↓
Order Success
  ↓
My Orders

Payment Security
- Razorpay Test Mode
- Razorpay credentials stored in .env
- Razorpay secret never exposed to frontend
- Server-side order creation
- Server-side total calculation
- Server-side stock validation
- HMAC-SHA256 payment signature verification
- Cart cleared only after successful payment verification
- Order ownership validation

🛠️ Tech Stack
Frontend
- React
- React Router
- JavaScript
- HTML
- CSS
- Axios
- React Context API
- Vite
Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Axios
- Razorpay
Development Tools
- VS Code
- Git
- GitHub
- MongoDB
- Razorpay Test Mode

📁 Project Structure
Mern-_Lab/
│
├── backend/
│   ├── config/
│   │   └── razorpay.js
│   │
│   ├── controllers/
│   │   ├── cart.controller.js
│   │   ├── customer.controller.js
│   │   ├── order.controller.js
│   │   ├── product.controller.js
│   │   └── wishlist.controller.js
│   │
│   ├── middlewares/
│   │   └── auth.middleware.js
│   │
│   ├── models/
│   │   ├── customer.model.js
│   │   ├── order.model.js
│   │   └── product.model.js
│   │
│   ├── routes/
│   │   ├── cart.routes.js
│   │   ├── customer.routes.js
│   │   ├── order.routes.js
│   │   ├── product.routes.js
│   │   └── wishlist.routes.js
│   │
│   ├── utils/
│   │   └── generateToken.js
│   │
│   ├── .env.example
│   ├── index.js
│   ├── package.json
│   └── seedProducts.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── package-lock.json
└── walkthrough.md

💳 Razorpay Test Mode

This project uses Razorpay Test Mode for payment testing.
No real money is involved.
To test payments:
1. Create a Razorpay account.
2. Switch to Test Mode.
3. Generate Test API keys.
4. Add them to backend/.env.
5. Start the backend.
6. Add products to the cart.
7. Go to Checkout.
8. Click Place Order & Pay.
9. Complete the test payment.
10. Verify the order in My Orders.


🔒 Security

The application implements several security practices:
- JWT authentication
- HTTP-only authentication cookies
- Protected APIs
- Server-side price calculation
- Server-side stock validation
- Order ownership validation
- Razorpay server-side order creation
- Razorpay signature verification
- Environment variables for secrets
- .env excluded from Git

📦 Order Status
Orders can have payment statuses such as:
PENDING
PAID
FAILED

Order statuses include:
PENDING_PAYMENT
PLACED
CONFIRMED
SHIPPED
DELIVERED

🧪 Testing
The application was tested for scenarios including:
- Empty cart
- Insufficient stock
- Invalid payment signature
- Payment failure
- Unauthenticated requests
- Unauthorized order access
- Successful Razorpay Test Mode payment
- Cart clearing after successful payment
- Order creation and retrieval

📚 Learning Outcomes
Through Labs 1–6, this project provided hands-on experience with:
- React development
- REST APIs
- Express.js
- MongoDB & Mongoose
- JWT authentication
- Protected routes
- React Context API
- State management
- E-commerce cart architecture
- Server-side validation
- Payment gateway integration
- Razorpay
- Payment signature verification
- Git & GitHub
- Full-stack MERN application development

👩‍💻 Author
Navitha Chekuri
Scaler School of Technology

📌 Repository
GitHub:
https://github.com/navithachekuri4-dot/Mern-_Lab

