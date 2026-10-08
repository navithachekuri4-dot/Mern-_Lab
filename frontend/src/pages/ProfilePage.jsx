import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Calendar,
  LogOut,
  CheckCircle2,
  Fingerprint,
} from 'lucide-react';
import { Button } from '../components/Button';
import { ChangePasswordModal } from './ChangePasswordModal';

export function ProfilePage({ customer, onLogout, loggingOut, addToast }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Avatar initials from fullName
  const initials = customer?.fullName
    ? customer.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'SK';

  // Format creation date
  const memberSince = customer?.createdAt
    ? new Date(customer.createdAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Active';

  return (
    <div className="profile-page-container">
      {/* 1. Customer Hero Card */}
      <div className="profile-hero-card">
        <div className="profile-identity-group">
          <div className="profile-large-avatar" aria-label="Customer avatar">
            {initials}
          </div>

          <div>
            <div className="profile-title-name">
              <span>{customer?.fullName || 'ShopKart Customer'}</span>
            </div>
            <div className="profile-subtitle-email">{customer?.email}</div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            onClick={() => setShowPasswordModal(true)}
            icon={<Key size={16} />}
            id="open-change-pw-btn"
          >
            Change Password
          </Button>

          <Button
            variant="danger"
            onClick={onLogout}
            loading={loggingOut}
            icon={<LogOut size={16} />}
            id="profile-logout-btn"
          >
            Sign out
          </Button>
        </div>
      </div>

      {/* 2. Authentic Customer Information Cards */}
      <div className="profile-grid-layout">
        {/* Card 1: Personal Contact Details */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="card-title-group">
              <User size={18} color="var(--brand-accent)" />
              <span>Personal Details</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> Active
            </span>
          </div>

          <div className="profile-card-body">
            <div className="detail-row-item">
              <span className="detail-row-label">Full Name</span>
              <span className="detail-row-val">{customer?.fullName}</span>
            </div>

            <div className="detail-row-item">
              <span className="detail-row-label">Email Address</span>
              <span className="detail-row-val">{customer?.email}</span>
            </div>

            <div className="detail-row-item">
              <span className="detail-row-label">Phone Number</span>
              <span className="detail-row-val">{customer?.phone}</span>
            </div>

            <div className="detail-row-item">
              <span className="detail-row-label">Customer ID</span>
              <span className="detail-row-val" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                {customer?._id || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Security & Session Status */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="card-title-group">
              <Shield size={18} color="var(--brand-accent)" />
              <span>Security & Credentials</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> Protected
            </span>
          </div>

          <div className="profile-card-body">
            <div className="detail-row-item">
              <span className="detail-row-label">Authentication Method</span>
              <span className="detail-row-val" style={{ color: 'var(--color-success)' }}>
                HttpOnly JWT Cookie
              </span>
            </div>

            <div className="detail-row-item">
              <span className="detail-row-label">Password Protection</span>
              <span className="detail-row-val">Bcrypt Hashed</span>
            </div>

            <div className="detail-row-item">
              <span className="detail-row-label">Member Since</span>
              <span className="detail-row-val">{memberSince}</span>
            </div>

            <div className="detail-row-item" style={{ paddingTop: '14px' }}>
              <span className="detail-row-label">Account Action</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPasswordModal(true)}
                style={{ color: 'var(--brand-accent)', fontWeight: 700 }}
              >
                Change password →
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        addToast={addToast}
      />
    </div>
  );
}
