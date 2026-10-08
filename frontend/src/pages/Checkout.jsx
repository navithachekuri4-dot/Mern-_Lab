import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  Truck,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader2,
  Package,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';

/**
 * Helper to dynamically load the official Razorpay Checkout SDK
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart, refreshCart } = useCart();

  // Filter valid cart items (product populated and quantity > 0)
  const validItems = cartItems.filter((item) => item?.product && item.quantity > 0);

  // Calculate frontend total only for display (backend recalculates and owns final total)
  const totalUnits = validItems.reduce((acc, item) => acc + item.quantity, 0);
  const displayTotal = validItems.reduce(
    (acc, item) => acc + (item.product.price || 0) * item.quantity,
    0
  );

  // Shipping Form State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
  });

  // UI State: validation errors, processing flag, and server error message
  const [validationErrors, setValidationErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Format currency in INR
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);

  // Form change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error on change
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    setErrorMessage('');
  };

  // STEP 4: Frontend Shipping Validation Rules
  const validateForm = () => {
    const errors = {};
    const { fullName, phone, addressLine, city, state, pincode } = shippingAddress;

    if (!fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    }

    if (!phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(phone.trim())) {
      errors.phone = 'Phone number must be exactly 10 digits.';
    }

    if (!addressLine.trim()) {
      errors.addressLine = 'Address line is required.';
    }

    if (!city.trim()) {
      errors.city = 'City is required.';
    }

    if (!state.trim()) {
      errors.state = 'State is required.';
    }

    if (!pincode.trim()) {
      errors.pincode = 'Pincode is required.';
    } else if (!/^\d{6}$/.test(pincode.trim())) {
      errors.pincode = 'Pincode must contain exactly 6 digits.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // STEP 5, 8, 9, 10, 11, 12: Order Creation & Razorpay Flow
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Guard: Prevent empty cart checkout
    if (validItems.length === 0) {
      setErrorMessage('Your cart is empty. Please add items to checkout.');
      return;
    }

    // Step 4 Validation
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Validating cart and creating payment order...');

    try {
      // Step A: Load Razorpay Checkout Script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setIsProcessing(false);
        setErrorMessage('Failed to load Razorpay SDK. Please check your internet connection.');
        return;
      }

      // Step B: Call Backend to validate stock/prices and create pending order
      // Frontend sends ONLY shippingAddress (backend retrieves and validates cart directly from DB)
      const orderResponse = await createPaymentOrder(shippingAddress);

      if (!orderResponse.success) {
        setIsProcessing(false);
        setErrorMessage(orderResponse.message || 'Could not initiate order.');
        return;
      }

      const {
        shopKartOrderId,
        razorpayOrderId,
        amount,
        currency,
        keyId,
        customerDetails,
      } = orderResponse;

      setStatusMessage('Opening secure payment checkout...');

      // Step C: Initialize Razorpay Checkout Options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency || 'INR',
        name: 'ShopKart',
        description: `Order #${shopKartOrderId}`,
        order_id: razorpayOrderId,
        prefill: {
          name: customerDetails?.name || shippingAddress.fullName,
          email: customerDetails?.email || '',
          contact: customerDetails?.phone || shippingAddress.phone,
        },
        theme: {
          color: '#0284c7', // Brand accent
        },
        // Step D: Payment Handler when user completes payment in Razorpay modal
        handler: async function (response) {
          try {
            setStatusMessage('Verifying payment signature with server...');
            setIsProcessing(true);

            // Step E: Send payment verification data to backend
            const verificationPayload = {
              shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            const verificationResult = await verifyPayment(verificationPayload);

            if (verificationResult.success) {
              // Step F: Payment verified!
              // 1. Clear frontend global cart state immediately
              clearCart();
              // 2. Refresh cart to confirm backend state is []
              await refreshCart();
              // 3. Navigate to Order Success page
              navigate(`/order-success/${shopKartOrderId}`);
            } else {
              setIsProcessing(false);
              setErrorMessage(
                verificationResult.message || 'Payment verification failed. Your cart is preserved.'
              );
            }
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr);
            setIsProcessing(false);
            setErrorMessage(
              verifyErr?.response?.data?.message ||
                'Payment verification failed. Cart has NOT been cleared. Please contact support.'
            );
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setStatusMessage('');
            setErrorMessage('Payment was cancelled. Your cart items have been saved.');
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      // Step G: Handle failed payment event
      razorpayInstance.on('payment.failed', function (failureResponse) {
        setIsProcessing(false);
        setStatusMessage('');
        setErrorMessage(
          failureResponse?.error?.description ||
            'Payment failed. Your cart has not been cleared. Please try again.'
        );
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('handlePlaceOrder error:', err);
      setIsProcessing(false);
      setStatusMessage('');
      const serverMessage =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' && !err.response.data.startsWith('<!')
          ? err.response.data
          : null) ||
        (err?.response?.status === 404
          ? 'Orders API endpoint not found (404). Please restart your backend server so the latest routes are loaded.'
          : null) ||
        err?.message ||
        'An unexpected error occurred while placing your order. Please try again.';
      setErrorMessage(serverMessage);
    }
  };

  // If cart is empty, redirect user back to cart
  if (validItems.length === 0) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.emptyCard} id="checkout-empty-state">
          <Package size={48} color="var(--ink-400)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '12px' }}>
            Your Cart is Empty
          </h2>
          <p style={{ color: 'var(--ink-500)', margin: '8px 0 20px' }}>
            You cannot proceed to checkout without any items in your cart.
          </p>
          <Link to="/products" className="btn btn-primary" id="checkout-browse-products-btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer} id="checkout-page-root">
      {/* Page Header */}
      <div style={styles.header}>
        <Link to="/cart" style={styles.backLink} id="checkout-back-to-cart">
          <ArrowLeft size={16} />
          <span>Back to Cart</span>
        </Link>
        <h1 style={styles.title} id="checkout-title">
          Checkout
        </h1>
        <p style={styles.subtitle}>
          Please enter your delivery details to complete your order.
        </p>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div style={styles.errorBanner} id="checkout-error-banner">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Processing Status Banner */}
      {isProcessing && statusMessage && (
        <div style={styles.infoBanner} id="checkout-status-banner">
          <Loader2 size={18} className="spinner" style={{ flexShrink: 0 }} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2-Column Checkout Layout */}
      <div style={styles.layout}>
        {/* Left Column: Shipping Form */}
        <div style={styles.formColumn}>
          <div style={styles.card} id="checkout-shipping-card">
            <div style={styles.cardHeader}>
              <Truck size={20} color="var(--brand-accent)" />
              <h2 style={styles.cardTitle}>Shipping Details</h2>
            </div>

            <form onSubmit={handlePlaceOrder} id="checkout-shipping-form" noValidate>
              {/* Full Name */}
              <div style={styles.fieldGroup}>
                <label htmlFor="fullName" style={styles.label}>
                  Full Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  style={{
                    ...styles.input,
                    ...(validationErrors.fullName ? styles.inputError : {}),
                  }}
                  disabled={isProcessing}
                />
                {validationErrors.fullName && (
                  <span style={styles.errorText} id="error-fullName">
                    {validationErrors.fullName}
                  </span>
                )}
              </div>

              {/* Phone */}
              <div style={styles.fieldGroup}>
                <label htmlFor="phone" style={styles.label}>
                  Phone Number (10 digits) <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  maxLength={10}
                  value={shippingAddress.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  style={{
                    ...styles.input,
                    ...(validationErrors.phone ? styles.inputError : {}),
                  }}
                  disabled={isProcessing}
                />
                {validationErrors.phone && (
                  <span style={styles.errorText} id="error-phone">
                    {validationErrors.phone}
                  </span>
                )}
              </div>

              {/* Address Line */}
              <div style={styles.fieldGroup}>
                <label htmlFor="addressLine" style={styles.label}>
                  Address Line <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  id="addressLine"
                  name="addressLine"
                  value={shippingAddress.addressLine}
                  onChange={handleChange}
                  placeholder="Flat No, Apartment, Street name"
                  style={{
                    ...styles.input,
                    ...(validationErrors.addressLine ? styles.inputError : {}),
                  }}
                  disabled={isProcessing}
                />
                {validationErrors.addressLine && (
                  <span style={styles.errorText} id="error-addressLine">
                    {validationErrors.addressLine}
                  </span>
                )}
              </div>

              {/* City and State (2-column row) */}
              <div style={styles.twoColRow}>
                <div style={styles.fieldGroup}>
                  <label htmlFor="city" style={styles.label}>
                    City <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai"
                    style={{
                      ...styles.input,
                      ...(validationErrors.city ? styles.inputError : {}),
                    }}
                    disabled={isProcessing}
                  />
                  {validationErrors.city && (
                    <span style={styles.errorText} id="error-city">
                      {validationErrors.city}
                    </span>
                  )}
                </div>

                <div style={styles.fieldGroup}>
                  <label htmlFor="state" style={styles.label}>
                    State <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleChange}
                    placeholder="e.g. Maharashtra"
                    style={{
                      ...styles.input,
                      ...(validationErrors.state ? styles.inputError : {}),
                    }}
                    disabled={isProcessing}
                  />
                  {validationErrors.state && (
                    <span style={styles.errorText} id="error-state">
                      {validationErrors.state}
                    </span>
                  )}
                </div>
              </div>

              {/* Pincode */}
              <div style={styles.fieldGroup}>
                <label htmlFor="pincode" style={styles.label}>
                  Pincode (6 digits) <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  maxLength={6}
                  value={shippingAddress.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 400001"
                  style={{
                    ...styles.input,
                    ...(validationErrors.pincode ? styles.inputError : {}),
                  }}
                  disabled={isProcessing}
                />
                {validationErrors.pincode && (
                  <span style={styles.errorText} id="error-pincode">
                    {validationErrors.pincode}
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div style={styles.summaryColumn}>
          <div style={styles.card} id="checkout-summary-card">
            <h2 style={styles.cardTitle}>Order Summary</h2>
            <div style={styles.divider} />

            {/* List of items */}
            <div style={styles.itemsList}>
              {validItems.map((item) => {
                const product = item.product;
                const itemTotal = (product.price || 0) * item.quantity;
                return (
                  <div key={item._id || product._id} style={styles.summaryItem}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={styles.summaryItemImg}
                      onError={(e) => {
                        e.target.src =
                          'https://placehold.co/60x60/f1f5f9/94a3b8?text=Product';
                      }}
                    />
                    <div style={styles.summaryItemInfo}>
                      <span style={styles.summaryItemName}>{product.name}</span>
                      <span style={styles.summaryItemQty}>Qty: {item.quantity} × {formatPrice(product.price)}</span>
                    </div>
                    <span style={styles.summaryItemPrice}>{formatPrice(itemTotal)}</span>
                  </div>
                );
              })}
            </div>

            <div style={styles.divider} />

            {/* Breakdown */}
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Total Items:</span>
              <span style={styles.summaryValue}>{totalUnits}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Delivery:</span>
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>FREE</span>
            </div>

            <div style={styles.divider} />

            {/* Grand Total */}
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total Amount:</span>
              <span style={styles.totalValue} id="checkout-total-amount">
                {formatPrice(displayTotal)}
              </span>
            </div>

            {/* Place Order Button */}
            <button
              type="button"
              className="btn btn-primary"
              id="checkout-place-order-btn"
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              style={{
                ...styles.placeOrderBtn,
                opacity: isProcessing ? 0.7 : 1,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  <span>Place Order & Pay</span>
                </>
              )}
            </button>

            <div style={styles.secureBadge}>
              <ShieldCheck size={16} color="var(--brand-accent)" />
              <span>Razorpay Test Mode 256-Bit SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--ink-500)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    marginBottom: '12px',
    fontWeight: 500,
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: 'var(--ink-900)',
    margin: '0 0 6px',
  },
  subtitle: {
    color: 'var(--ink-500)',
    fontSize: '0.9375rem',
    margin: 0,
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--color-danger)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: '24px',
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(2, 132, 199, 0.1)',
    color: 'var(--brand-accent)',
    border: '1px solid rgba(2, 132, 199, 0.25)',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: '24px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '32px',
    alignItems: 'start',
  },
  formColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  summaryColumn: {
    position: 'sticky',
    top: '90px',
  },
  card: {
    background: 'var(--surface-card, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  emptyCard: {
    background: 'var(--surface-card, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '14px',
    padding: '48px 24px',
    textAlign: 'center',
    maxWidth: '460px',
    margin: '40px auto',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '1.1875rem',
    fontWeight: 700,
    color: 'var(--ink-900)',
    margin: 0,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
  },
  twoColRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  label: {
    fontSize: '0.84375rem',
    fontWeight: 600,
    color: 'var(--ink-700)',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1.5px solid var(--border-color, #cbd5e1)',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'border-color 0.15s ease',
    background: 'var(--surface-input, #ffffff)',
    color: 'var(--ink-900)',
  },
  inputError: {
    borderColor: 'var(--color-danger, #ef4444)',
    background: 'rgba(239, 68, 68, 0.02)',
  },
  errorText: {
    fontSize: '0.75rem',
    color: 'var(--color-danger, #ef4444)',
    fontWeight: 500,
  },
  divider: {
    height: '1px',
    background: 'var(--border-color, #e2e8f0)',
    margin: '16px 0',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '260px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  summaryItemImg: {
    width: '46px',
    height: '46px',
    borderRadius: '8px',
    objectFit: 'cover',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
  },
  summaryItemInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
  summaryItemName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--ink-900)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  summaryItemQty: {
    fontSize: '0.75rem',
    color: 'var(--ink-500)',
  },
  summaryItemPrice: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--ink-800)',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    marginBottom: '8px',
  },
  summaryLabel: {
    color: 'var(--ink-500)',
  },
  summaryValue: {
    fontWeight: 600,
    color: 'var(--ink-800)',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  totalLabel: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--ink-900)',
  },
  totalValue: {
    fontSize: '1.375rem',
    fontWeight: 800,
    color: 'var(--brand-accent)',
  },
  placeOrderBtn: {
    width: '100%',
    padding: '13px',
    fontSize: '1rem',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '10px',
  },
  secureBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    color: 'var(--ink-500)',
    marginTop: '14px',
  },
};

export default Checkout;
