import React from 'react';

/**
 * Reusable Button component with loading state, icons, and variants
 */
export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  size = 'md',        // 'sm' | 'md'
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  type = 'button',
  onClick,
  className = '',
  id,
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const widthClass = fullWidth ? 'btn-block' : '';

  return (
    <button
      id={id}
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim()}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner" aria-hidden="true" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="btn-icon">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="btn-icon">{icon}</span>}
        </>
      )}
    </button>
  );
}
