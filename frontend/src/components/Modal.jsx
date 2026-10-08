import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible Modal dialog wrapper
 */
export function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            paddingBottom: '14px',
            borderBottom: '1px solid var(--ink-200)',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink-900)' }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--ink-500)',
              cursor: 'pointer',
            }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
