import axios from 'axios';

/**
 * ShopKart API Service
 * Configured with Axios to automatically send HttpOnly JWT cookies across requests.
 */
const api = axios.create({
  baseURL: 'http://localhost:5000', // Backend server base URL
  withCredentials: true,            // CRITICAL: Send and receive cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Register a new customer
export const registerCustomer = async (userData) => {
  const response = await api.post('/customers/register', userData);
  return response.data;
};

// 2. Login customer
export const loginCustomer = async (credentials) => {
  const response = await api.post('/customers/login', credentials);
  return response.data;
};

// 3. Get currently logged-in customer profile (Protected route)
export const getCurrentCustomer = async () => {
  const response = await api.get('/customers/me');
  return response.data;
};

// 4. Logout customer and clear session cookie
export const logoutCustomer = async () => {
  const response = await api.post('/customers/logout');
  return response.data;
};

// ============================================================
// PRODUCT API FUNCTIONS (Lab 3)
// ============================================================

// 5. Get all products — optionally filter by search term and/or category
//    Example: getProducts('keyboard', 'Electronics')
//    Sends: GET /products?search=keyboard&category=Electronics
export const getProducts = async (search = '', category = '') => {
  // Build the query string only for non-empty values
  const params = {};
  if (search.trim()) params.search = search.trim();
  if (category.trim() && category.trim() !== 'All') params.category = category.trim();

  const response = await api.get('/products', { params });
  return response.data;
};

// 6. Get a single product by its MongoDB ID
//    Example: getProductById('66d123abc456...')
//    Sends: GET /products/:id
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// 7. Create a new product (open API, no auth needed for Lab 3)
//    Used for testing via seed or manual creation
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

// ============================================================
// WISHLIST API FUNCTIONS (Lab 4)
// ============================================================

// 8. Add a product to the current user's wishlist
//    Sends: POST /wishlist/:productId
//    Auth cookie is sent automatically via withCredentials
export const addToWishlist = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  return response.data;
};

// 9. Get the current user's wishlist (populated with product details)
//    Sends: GET /wishlist
export const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

// 10. Remove a product from the current user's wishlist
//     Sends: DELETE /wishlist/:productId
export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

// ============================================================
// CART API FUNCTIONS (Lab 5)
// ============================================================

// 11. Add a product to the cart (or increase its quantity by 1 if already in cart)
//     Sends: POST /cart/:productId
//     Auth cookie is sent automatically via withCredentials
export const addToCart = async (productId) => {
  const response = await api.post(`/cart/${productId}`);
  return response.data;
};

// 12. Get the current user's cart (populated with full product details)
//     Sends: GET /cart
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

// 13. Update the quantity of a specific cart item
//     Sends: PATCH /cart/:productId   Body: { quantity }
export const updateCartQuantity = async (productId, quantity) => {
  const response = await api.patch(`/cart/${productId}`, { quantity });
  return response.data;
};

// 14. Remove a specific product from the cart
//     Sends: DELETE /cart/:productId
export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};

// ============================================================
// ORDER & CHECKOUT API FUNCTIONS (Lab 6)
// ============================================================

// 15. Create payment order (server-side stock & price validation, creates Razorpay order)
//     Sends: POST /orders/create-payment-order  Body: { shippingAddress }
export const createPaymentOrder = async (shippingAddress) => {
  const response = await api.post('/orders/create-payment-order', { shippingAddress });
  return response.data;
};

// 16. Verify payment signature on backend (HMAC-SHA256 verification)
//     Sends: POST /orders/verify-payment  Body: { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
export const verifyPayment = async (paymentData) => {
  const response = await api.post('/orders/verify-payment', paymentData);
  return response.data;
};

// 17. Get all orders placed by currently logged-in customer
//     Sends: GET /orders
export const getMyOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

// 18. Get a specific order by ID (with ownership check)
//     Sends: GET /orders/:id
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export default api;
