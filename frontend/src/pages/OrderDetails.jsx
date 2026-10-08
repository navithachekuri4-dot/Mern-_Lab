import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Truck,
  CreditCard,
  ShieldCheck,
  Package,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { getOrderById } from '../services/api';

export function OrderDetails() {
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

  const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    return new Date(isoDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      try {
        setLoading(true);
        const data = await getOrderById(id);
        if (isMounted) {
          setOrder(data.order);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              'Could not load order details. You may not have permission to view this order.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadOrder();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <div className="loading-container" id="order-details-loading">
          <div className="spinner" />
          <span className="loading-text">Loading order details...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.errorCard} id="order-details-error">
          <AlertCircle size={48} color="var(--color-danger)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '14px 0 8px' }}>
            Cannot View Order
          </h2>
          <p style={{ color: 'var(--ink-500)', marginBottom: '20px' }}>{error || 'Order not found.'}</p>
          <Link to="/orders" className="btn btn-primary" id="order-details-back-to-orders-btn">
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const address = order.shippingAddress || {};

  return (
    <div style={styles.pageContainer} id="order-details-page">
      {/* Top back navigation */}
      <div style={styles.topNav}>
        <Link to="/orders" style={styles.backLink} id="order-details-back-link">
          <ArrowLeft size={16} />
          <span>Back to All Orders</span>
        </Link>
      </div>

      {/* Order Header Card */}
      <div style={styles.headerCard}>
        <div style={styles.headerMain}>
          <div>
            <span style={styles.orderLabel}>Order</span>
            <h1 style={styles.orderTitle} id="order-details-id">#{order._id}</h1>
            <div style={styles.dateRow}>
              <Calendar size={14} color="var(--ink-400)" />
              <span>Placed on {formatDate(order.createdAt)}</span>
            </div>
          </div>

          <div style={styles.badgeColumn}>
            <div style={styles.badgeWrapper}>
              <span style={styles.badgeLabel}>Status:</span>
              <span style={styles.statusBadge} id="order-details-status">
                {order.status}
              </span>
            </div>
            <div style={styles.badgeWrapper}>
              <span style={styles.badgeLabel}>Payment:</span>
              <span style={styles.paymentBadge} id="order-details-payment-status">
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Items on Left, Delivery & Summary on Right */}
      <div style={styles.grid}>
        {/* Left: Purchased Items List (Snapshots) */}
        <div style={styles.itemsColumn}>
          <div style={styles.card}>
            <div style={styles.cardTitleRow}>
              <Package size={20} color="var(--brand-accent)" />
              <h2 style={styles.cardTitle}>Items in this Order ({items.length})</h2>
            </div>

            <div style={styles.itemsList}>
              {items.map((item, index) => {
                const itemTotal = (item.price || 0) * (item.quantity || 1);
                return (
                  <div key={item._id || index} style={styles.itemRow} id={`order-item-${index}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={styles.itemImg}
                      onError={(e) => {
                        e.target.src =
                          'https://placehold.co/80x80/f1f5f9/94a3b8?text=Product';
                      }}
                    />

                    <div style={styles.itemInfo}>
                      <h3 style={styles.itemName}>{item.name}</h3>
                      <div style={styles.itemPricing}>
                        <span style={styles.unitPrice}>
                          {formatPrice(item.price)} each
                        </span>
                        <span style={styles.qtyBadge}>Qty: {item.quantity}</span>
                      </div>
                    </div>

                    <div style={styles.itemSubtotal}>
                      <span style={styles.subtotalValue}>{formatPrice(itemTotal)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Shipping Address & Payment Details */}
        <div style={styles.sideColumn}>
          {/* Shipping Address Card */}
          <div style={styles.card}>
            <div style={styles.cardTitleRow}>
              <Truck size={20} color="var(--brand-accent)" />
              <h2 style={styles.cardTitle}>Delivery Address</h2>
            </div>

            <div style={styles.addressBox} id="order-details-shipping-address">
              <strong style={styles.recipientName}>{address.fullName}</strong>
              <p style={styles.addressText}>
                {address.addressLine}<br />
                {address.city}, {address.state} - {address.pincode}<br />
                Phone: {address.phone}
              </p>
            </div>
          </div>

          {/* Payment & Total Card */}
          <div style={styles.card}>
            <div style={styles.cardTitleRow}>
              <CreditCard size={20} color="var(--brand-accent)" />
              <h2 style={styles.cardTitle}>Payment Summary</h2>
            </div>

            <div style={styles.summaryList}>
              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Shipping</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>FREE</span>
              </div>
              <div style={styles.divider} />
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Grand Total</span>
                <span style={styles.totalValue} id="order-details-total-amount">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Razorpay Meta Info */}
            {order.razorpayPaymentId && (
              <div style={styles.rzpMetaBox}>
                <ShieldCheck size={14} color="#16a34a" />
                <span>
                  Razorpay ID: <code>{order.razorpayPaymentId}</code>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '36px 24px 60px',
    width: '100%',
    boxSizing: 'border-box',
  },
  topNav: {
    marginBottom: '16px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--ink-500)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  headerCard: {
    background: 'var(--surface-card, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '14px',
    padding: '24px 28px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
  headerMain: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
  },
  orderLabel: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'var(--ink-400)',
    fontWeight: 700,
  },
  orderTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--ink-900)',
    fontFamily: 'monospace',
    margin: '4px 0 6px',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--ink-500)',
    fontSize: '0.84375rem',
  },
  badgeColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-end',
  },
  badgeWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  badgeLabel: {
    fontSize: '0.8125rem',
    color: 'var(--ink-500)',
  },
  statusBadge: {
    background: '#dbeafe',
    color: '#1d4ed8',
    padding: '3px 12px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.4px',
  },
  paymentBadge: {
    background: '#dcfce7',
    color: '#15803d',
    padding: '3px 12px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.4px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  itemsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sideColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    background: 'var(--surface-card, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '14px',
    padding: '22px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
  },
  cardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border-color, #f1f5f9)',
    paddingBottom: '12px',
  },
  cardTitle: {
    fontSize: '1.0625rem',
    fontWeight: 700,
    color: 'var(--ink-900)',
    margin: 0,
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    paddingBottom: '14px',
    borderBottom: '1px solid var(--border-color, #f8fafc)',
  },
  itemImg: {
    width: '64px',
    height: '64px',
    borderRadius: '8px',
    objectFit: 'cover',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--ink-900)',
    margin: '0 0 4px',
  },
  itemPricing: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  unitPrice: {
    fontSize: '0.8125rem',
    color: 'var(--ink-500)',
  },
  qtyBadge: {
    fontSize: '0.75rem',
    fontWeight: 600,
    background: '#f1f5f9',
    color: 'var(--ink-700)',
    padding: '1px 8px',
    borderRadius: '6px',
  },
  itemSubtotal: {
    textAlign: 'right',
  },
  subtotalValue: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: 'var(--ink-900)',
  },
  addressBox: {
    fontSize: '0.875rem',
    lineHeight: '1.6',
    color: 'var(--ink-600)',
  },
  recipientName: {
    display: 'block',
    color: 'var(--ink-900)',
    fontSize: '0.9375rem',
    marginBottom: '4px',
  },
  addressText: {
    margin: 0,
  },
  summaryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    color: 'var(--ink-600)',
  },
  divider: {
    height: '1px',
    background: 'var(--border-color, #e2e8f0)',
    margin: '6px 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--ink-900)',
  },
  totalValue: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--brand-accent)',
  },
  rzpMetaBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '16px',
    padding: '8px 12px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    fontSize: '0.75rem',
    color: '#166534',
  },
  errorCard: {
    background: 'var(--surface-card, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '16px',
    padding: '48px 24px',
    textAlign: 'center',
    maxWidth: '460px',
    margin: '40px auto',
  },
};

export default OrderDetails;
