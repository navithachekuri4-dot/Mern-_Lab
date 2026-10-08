import React from 'react';
import { ShieldCheck, UserCheck, KeyRound, Check } from 'lucide-react';

/**
 * Left Showcase Panel for Desktop Split Layout
 * Clean, professional, and directly matches the ShopKart customer authentication assignment
 */
export function AuthShowcase({ mode = 'login' }) {
  return (
    <div className="auth-showcase-panel">
      <div className="showcase-bg-shapes" />

      {/* Top Tag */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div className="showcase-badge-pill">
          <span className="showcase-badge-dot" />
          <span>ShopKart Customer Portal</span>
        </div>
      </div>

      {/* Center Value Proposition */}
      <div className="showcase-content">
        <h2 className="showcase-heading">
          {mode === 'register' ? (
            <>
              Secure, seamless <span>customer access</span> for ShopKart.
            </>
          ) : (
            <>
              Welcome back to <span>your customer portal</span>.
            </>
          )}
        </h2>

        <p className="showcase-subtext">
          Manage your account credentials, view your profile details, and experience secure cookie-based session authentication with ShopKart.
        </p>

        {/* Feature Cards Group */}
        <div className="showcase-cards-group">
          <div className="showcase-feature-card">
            <div className="feature-icon-box">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="feature-title">HttpOnly Cookie Authentication</div>
              <div className="feature-desc">JWT tokens are securely stored in HttpOnly cookies to protect sessions.</div>
            </div>
          </div>

          <div className="showcase-feature-card">
            <div className="feature-icon-box">
              <UserCheck size={22} />
            </div>
            <div>
              <div className="feature-title">Protected Customer Profile</div>
              <div className="feature-desc">Access personal information verified through server-side authentication.</div>
            </div>
          </div>

          <div className="showcase-feature-card">
            <div className="feature-icon-box">
              <KeyRound size={22} />
            </div>
            <div>
              <div className="feature-title">Secure Password Management</div>
              <div className="feature-desc">Passwords are hashed using bcrypt and never exposed in responses.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Showcase Footer */}
      <div className="showcase-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} color="var(--brand-accent)" />
          <span>MERN Customer Authentication</span>
        </div>
        <span>ShopKart v1.0</span>
      </div>
    </div>
  );
}
