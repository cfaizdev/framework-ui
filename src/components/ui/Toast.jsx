import React from 'react';

const ICONS = { success: '✓', error: '✕', info: 'ℹ' };

export function Toast({ id, message, type, onClose }) {
  return (
    <div className={`toast toast--${type}`} role="alert">
      <span className="toast__icon">{ICONS[type] || 'ℹ'}</span>
      <span className="toast__msg">{message}</span>
      <button className="toast__close" onClick={() => onClose(id)}>✕</button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={onClose} />
      ))}
    </div>
  );
}
