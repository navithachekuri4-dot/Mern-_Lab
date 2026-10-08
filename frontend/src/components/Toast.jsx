import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Toast notification container & item renderer
 */
export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="assertive">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type || 'info'}`} role="alert">
          <div className="toast-message">
            {t.type === 'success' && <CheckCircle2 size={18} color="var(--color-success)" />}
            {t.type === 'error' && <AlertTriangle size={18} color="var(--color-danger)" />}
            {t.type === 'info' && <Info size={18} color="var(--color-info)" />}
            <span>{t.message}</span>
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
