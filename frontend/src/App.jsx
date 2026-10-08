import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';                          // Lab 5: Shopping Cart page
import Checkout from './pages/Checkout';                  // Lab 6: Checkout page
import OrderSuccess from './pages/OrderSuccess';          // Lab 6: Order confirmation
import MyOrders from './pages/MyOrders';                  // Lab 6: Orders list
import OrderDetails from './pages/OrderDetails';          // Lab 6: Single order details
import CartProvider from './context/CartContext';          // Lab 5: Global cart state
import { getCurrentCustomer } from './services/api';

/**
 * AppContent Component
 * Renders Navbar and connects routes.
 * Tracks authenticated customer state to dynamically update Navbar.
 */
function AppContent() {
  const [customer, setCustomer] = useState(null);
  const location = useLocation();

  // Check auth state when route changes to keep Navbar in sync
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const data = await getCurrentCustomer();
        if (isMounted) {
          setCustomer(data);
        }
      } catch (_err) {
        if (isMounted) {
          setCustomer(null);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  return (
    <div className="app-wrapper">
      {/* Top Navigation Bar */}
      <Navbar customer={customer} onLogoutSuccess={() => setCustomer(null)} />

      {/* Main Routed Content */}
      <main className="main-content">
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Home Route */}
          <Route path="/home" element={<Home />} />

          {/* Lab 3: Product Routes */}
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          {/* Lab 4: Wishlist Route */}
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Lab 5: Cart Route */}
          <Route path="/cart" element={<Cart />} />

          {/* Lab 6: Checkout and Orders Routes */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />

          {/* Default & Catch-all Redirects */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

/**
 * Root Application Component with React Router DOM BrowserRouter
 */
export function App() {
  return (
    <BrowserRouter>
      {/* CartProvider wraps everything so every page and component
          can access cart state via useCart() */}
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
