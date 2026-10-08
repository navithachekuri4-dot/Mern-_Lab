import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

/**
 * Cart Page Component — Lab 5: Shopping Cart
 * Route: /cart
 *
 * Consumes CartContext:
 *  - cartItems:      array of { _id, product: {...}, quantity }
 *  - loading:        boolean indicator while request is in-flight
 *  - error:          error message string
 *  - removeFromCart: async (productId) => { success, message }
 *  - updateQuantity: async (productId, quantity) => { success, message }
 *  - refreshCart:    async () => reload cart from backend
 */
function Cart() {
  const navigate = useNavigate();

  // 1. Consume shared cart state and actions from CartContext
  const {
    cartItems,
    loading,
    error,
    removeFromCart,
    updateQuantity,
    refreshCart,
  } = useCart();

  // 2. Local state for per-item action loading (prevents double clicks)
  // Stores the productId currently being updated or removed
  const [busyProductId, setBusyProductId] = useState(null);
  const [actionError, setActionError] = useState('');

  // 3. Helper to format price in Indian Rupees (INR)
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  // 4. Filter items that have a valid populated product object
  const validItems = (cartItems || []).filter(
    (item) => item && item.product && typeof item.product === 'object'
  );

  // 5. Calculate summary totals live
  const totalUnits = validItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = validItems.reduce(
    (acc, item) => acc + (item.product.price || 0) * item.quantity,
    0
  );

  // ── Handler: Increase Quantity ──────────────────────────────
  const handleIncrease = async (item) => {
    const product = item.product;
    if (!product || busyProductId) return;

    // Guard: Do not exceed available stock
    if (item.quantity >= product.stock) {
      setActionError(`Cannot add more. Only ${product.stock} units available in stock.`);
      setTimeout(() => setActionError(''), 3000);
      return;
    }

    setBusyProductId(product._id);
    setActionError('');
    const result = await updateQuantity(product._id, item.quantity + 1);
    if (!result?.success) {
      setActionError(result?.message || 'Could not update quantity.');
      setTimeout(() => setActionError(''), 3000);
    }
    setBusyProductId(null);
  };

  // ── Handler: Decrease Quantity ──────────────────────────────
  const handleDecrease = async (item) => {
    const product = item.product;
    if (!product || busyProductId) return;

    // Guard: Quantity must be at least 1 (to remove, user uses Remove button)
    if (item.quantity <= 1) {
      return;
    }

    setBusyProductId(product._id);
    setActionError('');
    const result = await updateQuantity(product._id, item.quantity - 1);
    if (!result?.success) {
      setActionError(result?.message || 'Could not update quantity.');
      setTimeout(() => setActionError(''), 3000);
    }
    setBusyProductId(null);
  };

  // ── Handler: Remove Item from Cart ──────────────────────────
  const handleRemove = async (productId) => {
    if (busyProductId) return;

    setBusyProductId(productId);
    setActionError('');
    const result = await removeFromCart(productId);
    if (!result?.success) {
      setActionError(result?.message || 'Could not remove item.');
      setTimeout(() => setActionError(''), 3000);
    }
    setBusyProductId(null);
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: Loading State
  // ─────────────────────────────────────────────────────────────
  if (loading && validItems.length === 0) {
    return (
      <div className="cart-page-container" style={styles.pageContainer}>
        <div className="loading-container" id="cart-loading">
          <div className="spinner" />
          <span className="loading-text">Loading your cart...</span>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: Error State (Initial load failure)
  // ─────────────────────────────────────────────────────────────
  if (error && validItems.length === 0) {
    return (
      <div className="cart-page-container" style={styles.pageContainer}>
        <div className="products-error-state" id="cart-error-state">
          <span>Unable to load cart</span>
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            id="cart-retry-btn"
            onClick={refreshCart}
            style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={15} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: Empty Cart State
  // ─────────────────────────────────────────────────────────────
  if (validItems.length === 0) {
    return (
      <div className="cart-page-container" style={styles.pageContainer}>
        {/* Page Title */}
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <ShoppingCart size={28} color="var(--brand-accent)" />
            <h1 style={styles.title}>My Cart</h1>
          </div>
        </div>

        {/* Empty state card */}
        <div className="products-empty-state" id="cart-empty-state" style={styles.emptyStateCard}>
          <div className="products-empty-icon">
            <ShoppingCart size={54} strokeWidth={1.5} style={{ opacity: 0.35, color: 'var(--ink-500)' }} />
          </div>
          <h3 className="products-empty-title" style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '12px' }}>
            Your cart is empty
          </h3>
          <p className="products-empty-subtitle" style={{ maxWidth: '380px', margin: '8px auto 0', color: 'var(--ink-500)' }}>
            Looks like you haven't added anything to your cart yet. Explore our collection and find something you like!
          </p>
          <button
            type="button"
            className="btn btn-primary"
            id="cart-browse-btn"
            onClick={() => navigate('/products')}
            style={{ marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ShoppingBag size={16} />
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: Active Cart with Items & Summary
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="cart-page-container" style={styles.pageContainer}>
      {/* Page Header */}
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <ShoppingCart size={28} color="var(--brand-accent)" />
          <h1 style={styles.title} id="cart-page-title">My Cart</h1>
        </div>
        <p style={styles.subtitle}>
          {totalUnits} {totalUnits === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      {/* Action Error Banner if any update/remove failed */}
      {actionError && (
        <div style={styles.errorBanner} id="cart-action-error">
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Cart Layout: Items Grid on left, Summary on right */}
      <div style={styles.layout}>
        {/* Left Column: List of Cart Items */}
        <div style={styles.itemsColumn}>
          {validItems.map((item) => {
            const product = item.product;
            const isBusy = busyProductId === product._id;
            const isMaxStock = item.quantity >= product.stock;
            const isMinQuantity = item.quantity <= 1;
            const itemSubtotal = (product.price || 0) * item.quantity;

            return (
              <div
                key={item._id || product._id}
                id={`cart-item-${product._id}`}
                style={{
                  ...styles.itemCard,
                  opacity: isBusy ? 0.6 : 1,
                }}
              >
                {/* Product Image */}
                <Link to={`/products/${product._id}`} style={styles.imageLink}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={styles.image}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/160x160/f1f5f9/94a3b8?text=Product';
                    }}
                  />
                </Link>

                {/* Product Info & Controls */}
                <div style={styles.itemDetails}>
                  <div style={styles.itemTopRow}>
                    <div>
                      {product.category && (
                        <span style={styles.categoryBadge}>{product.category}</span>
                      )}
                      <Link to={`/products/${product._id}`} style={styles.productNameLink}>
                        <h3 style={styles.productName}>{product.name}</h3>
                      </Link>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      id={`cart-remove-${product._id}`}
                      style={styles.removeBtn}
                      disabled={isBusy}
                      onClick={() => handleRemove(product._id)}
                      title="Remove product from cart"
                    >
                      <Trash2 size={16} />
                      <span style={{ fontSize: '0.8125rem' }}>Remove</span>
                    </button>
                  </div>

                  {/* Price & Stock info */}
                  <div style={styles.priceRow}>
                    <div style={styles.unitPrice}>
                      {formatPrice(product.price)}
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-400)', fontWeight: 400, marginLeft: '4px' }}>
                        each
                      </span>
                    </div>

                    {product.stock <= 5 && (
                      <span style={styles.stockWarning}>
                        <Package size={12} />
                        Only {product.stock} left in stock
                      </span>
                    )}
                  </div>

                  {/* Bottom Row: Quantity Controls & Item Subtotal */}
                  <div style={styles.itemBottomRow}>
                    {/* Quantity Stepper */}
                    <div style={styles.quantityStepper}>
                      {/* Decrease button */}
                      <button
                        type="button"
                        id={`cart-qty-decrease-${product._id}`}
                        style={{
                          ...styles.stepperBtn,
                          ...(isMinQuantity || isBusy ? styles.stepperBtnDisabled : {}),
                        }}
                        disabled={isMinQuantity || isBusy}
                        onClick={() => handleDecrease(item)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>

                      {/* Quantity Value */}
                      <span style={styles.quantityNumber} id={`cart-qty-value-${product._id}`}>
                        {item.quantity}
                      </span>

                      {/* Increase button */}
                      <button
                        type="button"
                        id={`cart-qty-increase-${product._id}`}
                        style={{
                          ...styles.stepperBtn,
                          ...(isMaxStock || isBusy ? styles.stepperBtnDisabled : {}),
                        }}
                        disabled={isMaxStock || isBusy}
                        onClick={() => handleIncrease(item)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Item Subtotal */}
                    <div style={styles.itemSubtotalWrapper}>
                      <span style={styles.subtotalLabel}>Total:</span>
                      <span style={styles.itemSubtotal} id={`cart-item-subtotal-${product._id}`}>
                        {formatPrice(itemSubtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Continue Shopping Link below items */}
          <Link to="/products" style={styles.continueShoppingLink} id="cart-continue-shopping">
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Right Column: Order Summary Card */}
        <div style={styles.summaryColumn}>
          <div style={styles.summaryCard} id="cart-order-summary">
            <h2 style={styles.summaryTitle}>Order Summary</h2>

            <div style={styles.summaryDivider} />

            {/* Breakdown rows */}
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Total Items:</span>
              <span style={styles.summaryValue}>{totalUnits}</span>
            </div>

            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Subtotal:</span>
              <span style={styles.summaryValue}>{formatPrice(totalPrice)}</span>
            </div>

            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Delivery:</span>
              <span style={{ ...styles.summaryValue, color: 'var(--color-success)', fontWeight: 600 }}>
                FREE
              </span>
            </div>

            <div style={styles.summaryDivider} />

            {/* Grand Total */}
            <div style={{ ...styles.summaryRow, marginTop: '4px', marginBottom: '4px' }}>
              <span style={styles.grandTotalLabel}>Total Amount:</span>
              <span style={styles.grandTotalValue} id="cart-grand-total">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <div style={styles.summaryDivider} />

            {/* Checkout Button */}
            <button
              type="button"
              className="btn btn-primary"
              id="cart-checkout-btn"
              style={styles.checkoutBtn}
              onClick={() => navigate('/checkout')}
            >
              <ShieldCheck size={18} />
              Proceed to Checkout
            </button>

            {/* Security Assurance badge */}
            <p style={styles.securityNote}>
              🔒 Safe & Secure Checkout with ShopKart
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Scoped Styles using ShopKart Design System CSS variables
// ─────────────────────────────────────────────────────────────
const styles = {
  pageContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '36px 24px 60px',
    width: '100%',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '28px',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 800,
    color: 'var(--ink-900)',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--ink-500)',
    marginTop: '6px',
    fontWeight: 500,
  },
  emptyStateCard: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: '60px 24px',
    textAlign: 'center',
    border: '1px solid var(--ink-200)',
    boxShadow: 'var(--shadow-sm)',
    maxWidth: '560px',
    margin: '40px auto 0',
  },
  errorBanner: {
    backgroundColor: 'var(--color-danger-bg)',
    color: 'var(--color-danger)',
    border: '1px solid var(--color-danger-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '20px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '32px',
    alignItems: 'start',
  },
  itemsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: '1 1 600px',
  },
  itemCard: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--ink-200)',
    padding: '18px',
    display: 'flex',
    gap: '18px',
    boxShadow: 'var(--shadow-xs)',
    transition: 'all var(--transition-fast)',
    boxSizing: 'border-box',
  },
  imageLink: {
    display: 'block',
    flexShrink: 0,
    width: '100px',
    height: '100px',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-surface-subtle)',
    border: '1px solid var(--ink-100)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minWidth: 0,
  },
  itemTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  categoryBadge: {
    display: 'inline-block',
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--brand-accent)',
    backgroundColor: 'var(--brand-accent-subtle)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    marginBottom: '4px',
  },
  productNameLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  productName: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--ink-900)',
    lineHeight: 1.35,
    margin: '2px 0 0',
  },
  removeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: 'var(--ink-400)',
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: 'var(--radius-xs)',
    transition: 'color var(--transition-fast)',
    flexShrink: 0,
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '8px 0',
    flexWrap: 'wrap',
  },
  unitPrice: {
    fontSize: '1.0625rem',
    fontWeight: 700,
    color: 'var(--ink-900)',
  },
  stockWarning: {
    fontSize: '0.75rem',
    color: 'var(--color-warning)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: 600,
  },
  itemBottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '6px',
    paddingTop: '10px',
    borderTop: '1px solid var(--ink-100)',
    flexWrap: 'wrap',
    gap: '12px',
  },
  quantityStepper: {
    display: 'inline-flex',
    alignItems: 'center',
    border: '1.5px solid var(--ink-200)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-surface)',
    overflow: 'hidden',
  },
  stepperBtn: {
    background: 'none',
    border: 'none',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--ink-700)',
    transition: 'all var(--transition-fast)',
  },
  stepperBtnDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  quantityNumber: {
    minWidth: '36px',
    textAlign: 'center',
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--ink-900)',
    userSelect: 'none',
  },
  itemSubtotalWrapper: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  subtotalLabel: {
    fontSize: '0.75rem',
    color: 'var(--ink-500)',
    fontWeight: 500,
  },
  itemSubtotal: {
    fontSize: '1.0625rem',
    fontWeight: 800,
    color: 'var(--brand-accent)',
  },
  continueShoppingLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--ink-600)',
    textDecoration: 'none',
    marginTop: '8px',
    padding: '8px 0',
  },
  summaryColumn: {
    flex: '0 0 340px',
    minWidth: '280px',
  },
  summaryCard: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--ink-200)',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    position: 'sticky',
    top: '90px',
  },
  summaryTitle: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--ink-900)',
    marginBottom: '16px',
  },
  summaryDivider: {
    height: '1px',
    backgroundColor: 'var(--ink-100)',
    margin: '14px 0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '8px 0',
    fontSize: '0.875rem',
  },
  summaryLabel: {
    color: 'var(--ink-500)',
    fontWeight: 500,
  },
  summaryValue: {
    color: 'var(--ink-800)',
    fontWeight: 600,
  },
  grandTotalLabel: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--ink-900)',
  },
  grandTotalValue: {
    fontSize: '1.375rem',
    fontWeight: 800,
    color: 'var(--brand-accent)',
  },
  checkoutBtn: {
    width: '100%',
    padding: '12px 18px',
    fontSize: '0.9375rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '16px',
    cursor: 'pointer',
    borderRadius: 'var(--radius-sm)',
  },
  securityNote: {
    fontSize: '0.75rem',
    color: 'var(--ink-400)',
    textAlign: 'center',
    marginTop: '14px',
    fontWeight: 500,
  },
};

export default Cart;
