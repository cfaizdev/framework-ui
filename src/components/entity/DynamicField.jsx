import React from 'react';
import CascadeSelect from './CascadeSelect';

/**
 * DynamicField — renders the correct input component based on field.type.
 */
export default function DynamicField({ field, servicePrefix, value, onChange, formValues, error }) {
  const handleChange = (val) => onChange(field.name, val);

  switch (field.type) {
    case 'TEXT':
      return (
        <input
          id={`field-${field.name}`}
          type="text"
          className={`form-control ${error ? 'error' : ''}`}
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder || ''}
          maxLength={field.validation?.maxLength || undefined}
          minLength={field.validation?.minLength || undefined}
        />
      );

    case 'EMAIL':
      return (
        <input
          id={`field-${field.name}`}
          type="email"
          className={`form-control ${error ? 'error' : ''}`}
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder || 'email@example.com'}
        />
      );

    case 'NUMBER':
      return (
        <input
          id={`field-${field.name}`}
          type="number"
          className={`form-control ${error ? 'error' : ''}`}
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder={field.placeholder || '0'}
          min={field.validation?.min ?? undefined}
          max={field.validation?.max ?? undefined}
        />
      );

    case 'DATE':
      return (
        <input
          id={`field-${field.name}`}
          type="date"
          className={`form-control ${error ? 'error' : ''}`}
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
        />
      );

    case 'DATETIME':
      return (
        <input
          id={`field-${field.name}`}
          type="datetime-local"
          className={`form-control ${error ? 'error' : ''}`}
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
        />
      );

    case 'TEXTAREA':
      return (
        <textarea
          id={`field-${field.name}`}
          className={`form-control ${error ? 'error' : ''}`}
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder || ''}
          rows={4}
        />
      );

    case 'BOOLEAN':
      return (
        <label className="toggle-wrapper" htmlFor={`field-${field.name}`}>
          <span className="toggle">
            <input
              id={`field-${field.name}`}
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => handleChange(e.target.checked)}
            />
            <span className="toggle__track" />
            <span className="toggle__thumb" />
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {value === true || value === 'true' ? 'Yes' : 'No'}
          </span>
        </label>
      );

    case 'PASSWORD':
      return (
        <input
          id={`field-${field.name}`}
          type="password"
          className={`form-control ${error ? 'error' : ''}`}
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder || '••••••••'}
          autoComplete="new-password"
        />
      );

    case 'SELECT': {
      // ENTITY datasource → CascadeSelect
      if ((field.dataSource || field.source)?.type === 'ENTITY') {
        return (
          <CascadeSelect
            field={field}
            servicePrefix={servicePrefix}
            value={value}
            onChange={(v) => handleChange(v)}
            formValues={formValues}
            error={error}
          />
        );
      }
      // STATIC options
      const opts = field.options || [];
      return (
        <select
          id={`field-${field.name}`}
          className={`form-control ${error ? 'error' : ''}`}
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
        >
          <option value="">Select {field.label}</option>
          {opts.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    default:
      return (
        <input
          id={`field-${field.name}`}
          type="text"
          className={`form-control ${error ? 'error' : ''}`}
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder || ''}
        />
      );
  }
}
