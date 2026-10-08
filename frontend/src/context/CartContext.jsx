import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateCartQuantity,
  removeFromCart as apiRemoveFromCart,
} from '../services/api';

// ─────────────────────────────────────────────────────────────
// STEP 1: Create the Context
//
// Think of this as an empty "container" that will hold our cart
// data. We export it so CartProvider can fill it, and any
// component can read from it using useCart().
// ─────────────────────────────────────────────────────────────
const CartContext = createContext();

// ─────────────────────────────────────────────────────────────
// STEP 2: CartProvider Component
//
// This component wraps our entire app (we do that in App.jsx).
// It holds the cart state and provides functions to modify it.
// Every component INSIDE the provider can access this state.
// ─────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  // cartItems: array of { _id, product: { name, price, image, ... }, quantity }
  // This is the raw data returned by GET /cart
  const [cartItems, setCartItems] = useState([]);

  // loading: true while a cart API request is in-flight
  const [loading, setLoading] = useState(false);

  // error: stores an error message string if any API call fails
  const [error, setError] = useState('');

  // ── refreshCart ──────────────────────────────────────────────
  // Fetches the latest cart from the backend and updates cartItems.
  // Called on first load, and after every add/remove/update.
  // ─────────────────────────────────────────────────────────────
  const refreshCart = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCart();          // GET /cart
      setCartItems(data.cart || []);         // store the array
    } catch (err) {
      // If the user is not logged in, the backend returns 401.
      // We silently clear the cart rather than showing an error.
      if (err?.response?.status === 401) {
        setCartItems([]);
      } else {
        setError('Could not load cart. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load the cart once when the app first starts
  useEffect(() => {
    refreshCart();
  }, []);

  // ── addToCart ────────────────────────────────────────────────
  // Calls POST /cart/:productId on the backend.
  // On success, refreshes cartItems so every component sees the update.
  // Returns an object so the caller can show success/error messages.
  // ─────────────────────────────────────────────────────────────
  const addToCart = async (productId) => {
    try {
      await apiAddToCart(productId);   // POST /cart/:productId
      await refreshCart();             // re-fetch so cartItems is up to date
      return { success: true };
    } catch (err) {
      // Pull the error message from the backend response if available
      const message =
        err?.response?.data?.message || 'Could not add product to cart.';
      return { success: false, message };
    }
  };

  // ── updateQuantity ───────────────────────────────────────────
  // Calls PATCH /cart/:productId with { quantity }.
  // Basic frontend guard: quantity must be >= 1.
  // On success, refreshes cartItems.
  // ─────────────────────────────────────────────────────────────
  const updateQuantity = async (productId, quantity) => {
    // Frontend guard — the backend also validates, but this avoids
    // an unnecessary network request for obviously invalid input
    if (!quantity || quantity < 1) {
      return { success: false, message: 'Quantity must be at least 1.' };
    }
    try {
      await apiUpdateCartQuantity(productId, quantity);  // PATCH /cart/:productId
      await refreshCart();                               // re-fetch updated cart
      return { success: true };
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Could not update quantity.';
      return { success: false, message };
    }
  };

  // ── removeFromCart ───────────────────────────────────────────
  // Calls DELETE /cart/:productId.
  // On success, refreshes cartItems so the item disappears instantly.
  // ─────────────────────────────────────────────────────────────
  const removeFromCart = async (productId) => {
    try {
      await apiRemoveFromCart(productId);   // DELETE /cart/:productId
      await refreshCart();                  // re-fetch so UI updates
      return { success: true };
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Could not remove product from cart.';
      return { success: false, message };
    }
  };

  // ── cartCount (derived, NOT stored separately) ───────────────
  // This is calculated live from cartItems every render.
  // Example: [{ quantity: 2 }, { quantity: 1 }] → cartCount = 3
  // We never store this in MongoDB or in a separate state variable.
  // ─────────────────────────────────────────────────────────────
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // ── clearCart ────────────────────────────────────────────────
  // Immediately resets local cart state to empty.
  // Used after successful order payment verification.
  // ─────────────────────────────────────────────────────────────
  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,        // the array of cart items (each has .product and .quantity)
    cartCount,        // total number of individual units across all items
    loading,          // true while a fetch is running
    error,            // error message string (empty if no error)
    refreshCart,      // re-fetch from backend
    clearCart,        // reset cart state to []
    addToCart,        // add a product (or increment its qty)
    updateQuantity,   // set a specific quantity for a cart item
    removeFromCart,   // remove a product from cart entirely
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// STEP 3: useCart — Custom Hook
//
// This is a shortcut. Instead of writing:
//   const { cartCount } = useContext(CartContext);
// in every component, you just write:
//   const { cartCount } = useCart();
//
// The guard ensures useCart() is only called inside a CartProvider.
// ─────────────────────────────────────────────────────────────
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside a <CartProvider>');
  }
  return context;
}

export default CartProvider;
