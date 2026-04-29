import React from 'react';

export default function Spinner({ size = '', className = '' }) {
  return <span className={`spinner ${size ? 'spinner--' + size : ''} ${className}`} role="status" aria-label="Loading" />;
}

export function SpinnerCenter({ size = 'lg' }) {
  return (
    <div className="spinner-center">
      <Spinner size={size} />
    </div>
  );
}
