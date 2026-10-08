import React from 'react';
import { Lock, LogIn, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';

/**
 * Clean, elegant 401 Unauthorized / Session Expired state
 */
export function UnauthorizedPage({ onNavigateToLogin }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div className="unauth-container">
        <div className="unauth-icon-circle">
          <Lock size={32} />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink-900)', marginBottom: '10px' }}>
          Authentication Required
        </h2>

        <p style={{ fontSize: '0.9375rem', color: 'var(--ink-600)', lineHeight: 1.6, marginBottom: '28px' }}>
          Your session is either expired, or this section is protected by ShopKart customer credentials. Please sign in to securely access your profile.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Button
            variant="primary"
            fullWidth
            onClick={onNavigateToLogin}
            icon={<LogIn size={18} />}
            id="unauth-login-btn"
          >
            Sign in to Your Account
          </Button>

          <Button
            variant="ghost"
            fullWidth
            onClick={onNavigateToLogin}
            id="unauth-register-btn"
          >
            Switch to Registration
          </Button>
        </div>

        <div style={{ marginTop: '24px', fontSize: '0.78125rem', color: 'var(--ink-400)' }}>
          HTTP 401 Unauthorized · HttpOnly Cookie Protected
        </div>
      </div>
    </div>
  );
}
