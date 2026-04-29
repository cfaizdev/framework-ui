/**
 * Resolves defaultValue tokens for a field definition.
 * Tokens: {{TODAY}}, {{NOW}}, {{CURRENT_USER}}
 */
export function resolveDefaultValue(defaultValue, userName = '') {
  if (!defaultValue) return '';
  if (defaultValue === '{{TODAY}}') {
    return new Date().toISOString().split('T')[0];
  }
  if (defaultValue === '{{NOW}}') {
    return new Date().toISOString().slice(0, 16); // datetime-local format
  }
  if (defaultValue === '{{CURRENT_USER}}') {
    return userName;
  }
  return defaultValue;
}

/**
 * Build initial form values from schema fields (for CREATE).
 * Applies defaultValue resolution.
 */
export function buildInitialValues(fields, userName) {
  const vals = {};
  (fields || []).forEach((f) => {
    if (f.type === 'BOOLEAN') {
      vals[f.name] = f.defaultValue === 'true' ? true : false;
    } else {
      vals[f.name] = resolveDefaultValue(f.defaultValue, userName);
    }
  });
  return vals;
}

/**
 * Returns the display value for a cell — booleans, truncation etc.
 */
export function formatCellValue(value, type) {
  if (value === null || value === undefined || value === '') return '—';
  if (type === 'BOOLEAN') return value ? '✓' : '✗';
  if (type === 'PASSWORD') return '••••••';
  if (typeof value === 'string' && value.length > 60) return value.slice(0, 60) + '…';
  return String(value);
}

/**
 * Returns icon for entity name.
 */
export function entityIcon(name) {
  const icons = {
    employee: '👤', department: '🏢', country: '🌍', state: '📍',
    product: '📦', order: '🛒', user: '👥', branch: '🏬',
    company: '🏛️', role: '🔐', invoice: '🧾', category: '🏷️',
    project: '📂', task: '✅', customer: '🤝', vendor: '🏭',
    permission: '🛡️',
  };
  return icons[name?.toLowerCase()] || '📋';
}
