import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut, Home, Package, Heart, ShoppingCart, ClipboardList } from 'lucide-react';
import { logoutCustomer } from '../services/api';
import { useCart } from '../context/CartContext';  // Lab 5: global cart state

/**
 * Navbar Component for ShopKart
 * Features:
 * - Brand logo linking to Home
 * - Home navigation link
 * - Logout button calling POST /customers/logout
 * - Clean responsive navigation bar
 */
export function Navbar({ customer, onLogoutSuccess }) {
  const navigate = useNavigate();

  // Lab 5: read the live cart count from CartContext
  // cartCount = total units across all cart items (e.g. Keyboard×2 + Mouse×1 = 3)
  const { cartCount } = useCart();

  // Handle logout: calls the API to clear cookies, then redirects to /login
  const handleLogout = async () => {
    try {
      await logoutCustomer();
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Navigate to login even on network error to ensure safe client state
      navigate('/login');
    }
  };

  return (
    <header className="navbar-root">
      <div className="navbar-container">
        {/* ShopKart Logo and Branding */}
        <Link to="/home" className="brand-logo-wrap" id="nav-brand-logo">
          <div className="brand-logo-icon">
            <ShoppingBag size={20} strokeWidth={2.4} />
          </div>
          <span className="brand-wordmark">
            Shop<span>Kart</span>
          </span>
        </Link>

        {/* Navigation Links and Logout Button */}
        <nav className="navbar-actions">
          <Link to="/home" className="nav-link" id="nav-home-link">
            <Home size={16} />
            <span>Home</span>
          </Link>

          {/* Products link — always visible */}
          <Link to="/products" className="nav-link" id="nav-products-link">
            <Package size={16} />
            <span>Products</span>
          </Link>

          {/* Wishlist link — Lab 4 */}
          <Link to="/wishlist" className="nav-link" id="nav-wishlist-link">
            <Heart size={16} />
            <span>Wishlist</span>
          </Link>

          {/* Cart link — Lab 5 */}
          <Link to="/cart" className="nav-link" id="nav-cart-link">
            <ShoppingCart size={16} />
            <span>
              Cart{cartCount > 0 && (
                <span
                  id="nav-cart-count"
                  style={{
                    marginLeft: '5px',
                    background: 'var(--brand-accent)',
                    color: '#fff',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '1px 7px',
                    verticalAlign: 'middle',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </span>
          </Link>

          {/* Orders link — Lab 6 */}
          {customer && (
            <Link to="/orders" className="nav-link" id="nav-orders-link">
              <ClipboardList size={16} />
              <span>Orders</span>
            </Link>
          )}

          {customer ? (
            <div className="nav-user-section" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="user-badge-chip" title={customer.email}>
                <div className="avatar-bubble">
                  {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-name-text" style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {customer.fullName}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                id="navbar-logout-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="btn btn-secondary nav-auth-btn" id="nav-login-btn">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary nav-auth-btn" id="nav-register-btn">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
