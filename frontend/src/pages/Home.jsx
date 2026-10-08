import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, LogOut, CheckCircle } from 'lucide-react';
import { getCurrentCustomer, logoutCustomer } from '../services/api';

/**
 * Protected Home Page
 * Route: /home
 * 
 * Flow:
 * 1. Calls GET /customers/me on mount to fetch the authenticated customer.
 * 2. If authentication fails (e.g. 401 Unauthorized), immediately redirects to /login.
 * 3. If authenticated, renders the customer profile dashboard.
 */
export function Home() {
  const navigate = useNavigate();

  // Component states
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Fetch current authenticated customer from backend on component mount
  useEffect(() => {
    let isMounted = true;

    async function fetchCustomerProfile() {
      try {
        setLoading(true);
        // GET /customers/me with credentials/cookies
        const data = await getCurrentCustomer();
        
        if (isMounted) {
          // Backend returns customer profile object
          setCustomer(data);
        }
      } catch (err) {
        // If unauthenticated or token is expired/missing, redirect to login
        console.warn('Unauthenticated access attempt or expired session:', err.message);
        if (isMounted) {
          navigate('/login');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCustomerProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Handle logout action
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutCustomer();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span className="loading-text">Loading profile...</span>
      </div>
    );
  }

  // If customer is not available (safety fallback)
  if (!customer) {
    return null;
  }

  // Get initials for avatar
  const initials = customer.fullName
    ? customer.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'SK';

  return (
    <div className="home-page-container">
      {/* 1. Welcome Hero Banner */}
      <div className="profile-hero-card">
        <div className="profile-identity-group">
          <div className="profile-large-avatar" aria-label="Customer avatar">
            {initials}
          </div>

          <div>
            <div className="profile-title-name">
              <span>Welcome back, {customer.fullName}!</span>
            </div>
            <div className="profile-subtitle-email">{customer.email}</div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Browse Products link — Lab 3 entry point */}
          <a
            href="/products"
            className="btn btn-primary"
            id="home-browse-products-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0 20px', height: '40px' }}
          >
            🛍️ <span>Browse Products</span>
          </a>

          <button
            type="button"
            className="btn btn-danger"
            onClick={handleLogout}
            disabled={loggingOut}
            id="home-logout-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <LogOut size={16} />
            <span>{loggingOut ? 'Signing out...' : 'Sign out'}</span>
          </button>
        </div>
      </div>

      {/* 2. Customer Details Dashboard */}
      <div className="profile-grid-layout">
        {/* Card 1: Personal Details */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="card-title-group">
              <User size={18} color="var(--brand-accent)" />
              <span style={{ fontWeight: 700 }}>Customer Details</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={13} /> Authenticated
            </span>
          </div>

          <div className="profile-card-body">
            <div className="detail-row-item">
              <span className="detail-row-label">Full Name</span>
              <span className="detail-row-val" id="display-customer-name">
                {customer.fullName}
              </span>
            </div>

            <div className="detail-row-item">
              <span className="detail-row-label">Email Address</span>
              <span className="detail-row-val" id="display-customer-email">
                {customer.email}
              </span>
            </div>

            <div className="detail-row-item">
              <span className="detail-row-label">Phone Number</span>
              <span className="detail-row-val" id="display-customer-phone">
                {customer.phone}
              </span>
            </div>

            <div className="detail-row-item">
              <span className="detail-row-label">Customer ID</span>
              <span className="detail-row-val" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                {customer._id || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Security & Session Status */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="card-title-group">
              <ShieldCheck size={18} color="var(--brand-accent)" />
              <span style={{ fontWeight: 700 }}>Session & Security</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={13} /> Active
            </span>
          </div>

          <div className="profile-card-body">
            <div className="detail-row-item">
              <span className="detail-row-label">Authentication Type</span>
              <span className="detail-row-val" style={{ color: 'var(--color-success)' }}>
                HttpOnly JWT Cookie
              </span>
            </div>

            <div className="detail-row-item">
              <span className="detail-row-label">Session Protection</span>
              <span className="detail-row-val">Encrypted & Secure</span>
            </div>

            <div className="detail-row-item">
              <span className="detail-row-label">Verification Endpoint</span>
              <span className="detail-row-val" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                GET /customers/me
              </span>
            </div>

            <div className="detail-row-item">
              <span className="detail-row-label">Account Status</span>
              <span className="detail-row-val" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                Verified Customer
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
