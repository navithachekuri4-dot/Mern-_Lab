import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable Input component with label, prefix icon, error & helper states
 */
export function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helperText,
  icon: Icon,
  disabled = false,
  required = false,
  autoComplete,
  className = '',
  rightLabel,
  ...props
}) {
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
        {Icon && (
          <span className="form-input-icon">
            <Icon size={18} />
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`form-input ${!Icon ? 'no-icon' : ''} ${error ? 'error' : ''}`.trim()}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
      </div>

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
