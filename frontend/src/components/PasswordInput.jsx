import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * Calculates password strength score (0-4) and text description
 */
export function getPasswordStrength(password = '') {
  if (!password) return { score: 0, label: 'None', variant: '' };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  switch (score) {
    case 1:
      return { score: 1, label: 'Weak', variant: 'weak' };
    case 2:
      return { score: 2, label: 'Fair', variant: 'fair' };
    case 3:
      return { score: 3, label: 'Good', variant: 'good' };
    case 4:
      return { score: 4, label: 'Strong', variant: 'strong' };
    default:
      return { score: 0, label: 'Too short (min 8 chars)', variant: 'weak' };
  }
}

/**
 * Reusable PasswordInput with eye toggle and interactive strength meter
 */
export function PasswordInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder = '••••••••',
  error,
  helperText,
  disabled = false,
  required = false,
  showStrength = false,
  autoComplete = 'current-password',
  rightLabel,
  className = '',
  ...props
}) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? getPasswordStrength(value) : null;

  return (
    <div className={`form-group ${className}`.trim()}>
      {(label || rightLabel) && (
        <label htmlFor={id} className="form-label">
          <span>
            {label} {required && <span style={{ color: 'var(--brand-accent)' }}>*</span>}
          </span>
          {rightLabel && <span>{rightLabel}</span>}
        </label>
      )}

      <div className="form-input-wrapper">
        <span className="form-input-icon">
          <Lock size={18} />
        </span>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`form-input has-toggle ${error ? 'error' : ''}`.trim()}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="password-toggle-btn"
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="password-strength-container" aria-live="polite">
          <div className="strength-bars-row">
            <div className={`strength-bar-unit ${strength.score >= 1 ? `active-${strength.variant}` : ''}`} />
            <div className={`strength-bar-unit ${strength.score >= 2 ? `active-${strength.variant}` : ''}`} />
            <div className={`strength-bar-unit ${strength.score >= 3 ? `active-${strength.variant}` : ''}`} />
            <div className={`strength-bar-unit ${strength.score >= 4 ? `active-${strength.variant}` : ''}`} />
          </div>
          <div className="strength-label-text">
            <span>Security score</span>
            <span style={{ fontWeight: 700 }}>{strength.label}</span>
          </div>
        </div>
      )}

      {error ? (
        <div id={`${id}-error`} className="form-error-msg">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p id={`${id}-helper`} className="form-helper">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
