import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  ClipboardList,
  AlertCircle,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { getOrderById } from '../services/api';

export function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrder() {
      try {
        setLoading(true);
        const data = await getOrderById(id);
        if (isMounted) {
          setOrder(data.order);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.data?.message || 'Could not load order details.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchOrder();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <div className="loading-container" id="order-success-loading">
          <div className="spinner" />
          <span className="loading-text">Loading order confirmation...</span>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.card} id="order-success-error">
          <AlertCircle size={48} color="var(--color-danger)" />
          <h2 style={{ margin: '14px 0 8px', color: 'var(--ink-900)' }}>Order Not Found</h2>
          <p style={{ color: 'var(--ink-500)', marginBottom: '20px' }}>{error}</p>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer} id="order-success-page">
      <div style={styles.card}>
        {/* Success Icon */}
        <div style={styles.iconWrapper}>
          <CheckCircle2 size={54} color="#16a34a" />
        </div>

        {/* Title & Subtitle */}
        <h1 style={styles.title} id="order-success-title">
          Order Placed Successfully!
        </h1>
        <p style={styles.subtitle}>
          Thank you for shopping with ShopKart. Your payment has been verified and your order is confirmed.
        </p>

        {/* Order Meta Box */}
        <div style={styles.metaBox}>
          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>Order ID:</span>
            <span style={styles.metaValue} id="order-success-id">
              {order?._id || id}
            </span>
          </div>

          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>Order Status:</span>
            <span style={styles.statusBadge} id="order-success-status">
              {order?.status || 'PLACED'}
            </span>
          </div>

          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>Payment Status:</span>
            <span style={styles.paidBadge} id="order-success-payment-status">
              {order?.paymentStatus || 'PAID'}
            </span>
          </div>

          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>Total Amount:</span>
            <span style={styles.totalValue} id="order-success-total">
              {formatPrice(order?.totalAmount)}
            </span>
          </div>

          {order?.shippingAddress && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border-color, #e2e8f0)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--ink-700)', fontWeight: 600, fontSize: '0.84375rem' }}>
                <Truck size={15} color="var(--brand-accent)" />
                <span>Shipping Address</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--ink-600)', lineHeight: '1.4' }}>
                {order.shippingAddress.fullName} • {order.shippingAddress.phone}<br />
                {order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={styles.buttonGroup}>
          <Link
            to="/orders"
            className="btn btn-primary"
            id="order-success-view-orders-btn"
            style={styles.actionBtn}
          >
            <ClipboardList size={17} />
            <span>View My Orders</span>
          </Link>

          <Link
            to="/products"
            className="btn btn-secondary"
            id="order-success-continue-shopping-btn"
            style={styles.actionBtn}
          >
            <ShoppingBag size={17} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '48px 24px 80px',
    width: '100%',
    boxSizing: 'border-box',
  },
  card: {
    background: 'var(--surface-card, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '16px',
    padding: '36px 32px',
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
  },
  iconWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '84px',
    height: '84px',
    borderRadius: '50%',
    background: 'rgba(22, 163, 74, 0.1)',
    marginBottom: '16px',
  },
  title: {
    fontSize: '1.625rem',
    fontWeight: 800,
    color: 'var(--ink-900)',
    margin: '0 0 8px',
  },
  subtitle: {
    fontSize: '0.9375rem',
    color: 'var(--ink-500)',
    margin: '0 auto 28px',
    maxWidth: '460px',
    lineHeight: '1.5',
  },
  metaBox: {
    background: 'var(--surface-subtle, #f8fafc)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'left',
    marginBottom: '28px',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    fontSize: '0.875rem',
  },
  metaLabel: {
    color: 'var(--ink-500)',
    fontWeight: 500,
  },
  metaValue: {
    color: 'var(--ink-900)',
    fontWeight: 600,
    fontFamily: 'monospace',
    fontSize: '0.8125rem',
  },
  statusBadge: {
    background: '#dbeafe',
    color: '#1d4ed8',
    padding: '2px 10px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  paidBadge: {
    background: '#dcfce7',
    color: '#15803d',
    padding: '2px 10px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  totalValue: {
    color: 'var(--brand-accent)',
    fontWeight: 800,
    fontSize: '1.125rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '14px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 22px',
    borderRadius: '9px',
    fontWeight: 600,
    fontSize: '0.9375rem',
    textDecoration: 'none',
  },
};

export default OrderSuccess;
