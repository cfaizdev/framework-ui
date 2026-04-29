import React from 'react';

const STATUS_MAP = {
  ACTIVE:      'success',
  INACTIVE:    'muted',
  ON_LEAVE:    'warning',
  TERMINATED:  'danger',
  PENDING:     'warning',
  APPROVED:    'success',
  REJECTED:    'danger',
  SUSPENDED:   'danger',
  FREE:        'muted',
  PRO:         'accent',
  ENTERPRISE:  'info',
  true:        'success',
  false:       'muted',
  CREATE:      'success',
  UPDATE:      'info',
  DELETE:      'danger',
};

export default function Badge({ value, variant }) {
  const computed = variant || STATUS_MAP[String(value)] || 'muted';
  return (
    <span className={`badge badge--${computed}`}>
      {String(value)}
    </span>
  );
}
