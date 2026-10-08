import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Package,
  Calendar,
  CreditCard,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { getMyOrders } from '../services/api';

export function MyOrders() {
  const [orders, setOrders] = useState([]);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(
        err?.response?.data?.message || 'Could not load your orders. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PLACED':
      case 'CONFIRMED':
        return { bg: '#dbeafe', color: '#1d4ed8', label: status };
      case 'SHIPPED':
        return { bg: '#fef3c7', color: '#b45309', label: 'SHIPPED' };
      case 'DELIVERED':
        return { bg: '#dcfce7', color: '#15803d', label: 'DELIVERED' };
      case 'PENDING_PAYMENT':
        return { bg: '#fee2e2', color: '#b91c1c', label: 'PENDING PAYMENT' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: status };
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <div className="loading-container" id="my-orders-loading">
          <div className="spinner" />
          <span className="loading-text">Loading your orders...</span>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error && orders.length === 0) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.stateCard} id="my-orders-error">
          <AlertCircle size={44} color="var(--color-danger)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '14px 0 6px' }}>
            Unable to Load Orders
          </h3>
          <p style={{ color: 'var(--ink-500)', marginBottom: '18px' }}>{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={fetchOrders}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={15} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (orders.length === 0) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <ClipboardList size={26} color="var(--brand-accent)" />
            <h1 style={styles.title}>My Orders</h1>
          </div>
        </div>

        <div style={styles.stateCard} id="my-orders-empty">
          <ShoppingBag size={52} strokeWidth={1.5} style={{ opacity: 0.35, color: 'var(--ink-500)' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '14px 0 6px' }}>
            You have not placed any orders yet.
          </h3>
          <p style={{ color: 'var(--ink-500)', maxWidth: '360px', margin: '0 auto 24px' }}>
            When you complete a purchase, your order history and tracking details will appear here.
          </p>
          <Link
            to="/products"
            className="btn btn-primary"
            id="my-orders-start-shopping-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ShoppingBag size={16} />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  // 4. Active Orders List
  return (
    <div style={styles.pageContainer} id="my-orders-page">
      {/* Page Header */}
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <ClipboardList size={26} color="var(--brand-accent)" />
          <h1 style={styles.title} id="my-orders-title">
            My Orders
          </h1>
        </div>
        <p style={styles.subtitle}>
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
        </p>
      </div>

      {/* Orders List */}
      <div style={styles.ordersList}>
        {orders.map((order) => {
          const badge = getStatusBadge(order.status);
          const totalItemsCount = (order.items || []).reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          return (
            <div
              key={order._id}
              style={styles.orderCard}
              id={`order-card-${order._id}`}
            >
              {/* Order Card Top Bar */}
              <div style={styles.cardHeader}>
                <div style={styles.headerLeft}>
                  <div style={styles.orderIdGroup}>
                    <span style={styles.orderIdLabel}>Order ID:</span>
                    <span style={styles.orderIdValue}>#{order._id}</span>
                  </div>
                  <div style={styles.dateGroup}>
                    <Calendar size={13} color="var(--ink-400)" />
                    <span style={styles.dateValue}>{formatDate(order.createdAt)}</span>
                  </div>
                </div>

                <div style={styles.headerRight}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      background: badge.bg,
                      color: badge.color,
                    }}
                    id={`order-status-${order._id}`}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>

              {/* Items Preview Row */}
              <div style={styles.itemsPreview}>
                <div style={styles.itemsThumbs}>
                  {(order.items || []).slice(0, 4).map((item, idx) => (
                    <div key={idx} style={styles.thumbWrap} title={`${item.name} (Qty: ${item.quantity})`}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={styles.thumbImg}
                        onError={(e) => {
                          e.target.src =
                            'https://placehold.co/60x60/f1f5f9/94a3b8?text=Product';
                        }}
                      />
                      {item.quantity > 1 && (
                        <span style={styles.thumbQty}>×{item.quantity}</span>
                      )}
                    </div>
                  ))}
                  {(order.items || []).length > 4 && (
                    <div style={styles.moreThumbs}>
                      +{order.items.length - 4} more
                    </div>
                  )}
                </div>

                <div style={styles.itemNamesSummary}>
                  <p style={styles.itemNamesText}>
                    {(order.items || []).map((i) => i.name).join(', ')}
                  </p>
                  <span style={styles.itemsCountText}>
                    {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              {/* Order Card Footer */}
              <div style={styles.cardFooter}>
                <div style={styles.footerTotal}>
                  <span style={styles.totalLabel}>Total:</span>
                  <span style={styles.totalAmount} id={`order-total-${order._id}`}>
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>

                <Link
                  to={`/orders/${order._id}`}
                  className="btn btn-secondary btn-sm"
                  id={`view-order-details-${order._id}`}
                  style={styles.detailsBtn}
                >
                  <span>View Details</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '36px 24px 60px',
    width: '100%',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '24px',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  title: {
    fontSize: '1.625rem',
    fontWeight: 800,
    color: 'var(--ink-900)',
    margin: 0,
  },
  subtitle: {
    color: 'var(--ink-500)',
    fontSize: '0.9375rem',
    margin: '6px 0 0',
  },
  stateCard: {
    background: 'var(--surface-card, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '16px',
    padding: '48px 24px',
    textAlign: 'center',
    maxWidth: '460px',
    margin: '40px auto',
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  orderCard: {
    background: 'var(--surface-card, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '14px',
    padding: '20px 22px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
    transition: 'border-color 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color, #f1f5f9)',
    paddingBottom: '14px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  orderIdGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  orderIdLabel: {
    fontSize: '0.8125rem',
    color: 'var(--ink-500)',
    fontWeight: 500,
  },
  orderIdValue: {
    fontSize: '0.875rem',
    fontFamily: 'monospace',
    fontWeight: 700,
    color: 'var(--ink-900)',
  },
  dateGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  dateValue: {
    fontSize: '0.8125rem',
    color: 'var(--ink-500)',
  },
  headerRight: {},
  statusBadge: {
    padding: '3px 12px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.4px',
  },
  itemsPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  itemsThumbs: {
    display: 'flex',
    gap: '8px',
  },
  thumbWrap: {
    position: 'relative',
  },
  thumbImg: {
    width: '54px',
    height: '54px',
    borderRadius: '8px',
    objectFit: 'cover',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
  },
  thumbQty: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    background: 'var(--ink-800)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 700,
    padding: '1px 5px',
    borderRadius: '6px',
  },
  moreThumbs: {
    width: '54px',
    height: '54px',
    borderRadius: '8px',
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--ink-600)',
  },
  itemNamesSummary: {
    flex: 1,
    minWidth: '200px',
  },
  itemNamesText: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--ink-800)',
    margin: '0 0 4px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  itemsCountText: {
    fontSize: '0.75rem',
    color: 'var(--ink-400)',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border-color, #f1f5f9)',
    paddingTop: '14px',
  },
  footerTotal: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  totalLabel: {
    fontSize: '0.875rem',
    color: 'var(--ink-500)',
  },
  totalAmount: {
    fontSize: '1.1875rem',
    fontWeight: 800,
    color: 'var(--brand-accent)',
  },
  detailsBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    textDecoration: 'none',
  },
};

export default MyOrders;
