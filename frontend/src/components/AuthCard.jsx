import React from 'react';

/**
 * Reusable AuthCard container for Login, Register, and Account forms
 */
export function AuthCard({ title, subtitle, children, footer, className = '' }) {
  return (
    <div className={`auth-form-container ${className}`.trim()}>
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-card-title">{title}</h1>
          {subtitle && <p className="auth-card-subtitle">{subtitle}</p>}
        </div>

        <div className="auth-card-body">{children}</div>

        {footer && (
          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--ink-200)',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--ink-600)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
