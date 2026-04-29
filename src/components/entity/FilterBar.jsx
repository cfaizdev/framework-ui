import React, { useState } from 'react';

/**
 * FilterBar — renders filterable=true fields as filter inputs.
 */
export default function FilterBar({ schema, filters, onFilterChange, onReset }) {
  const filterableFields = (schema?.fields || [])
    .filter((f) => f.filterable)
    .sort((a, b) => a.order - b.order);

  if (filterableFields.length === 0) return null;

  return (
    <div className="filter-bar" id={`filter-bar-${schema?.entityName}`}>
      {filterableFields.map((field) => (
        <div key={field.name} className="filter-bar__field">
          <label className="filter-bar__label" htmlFor={`filter-${field.name}`}>
            {field.label}
          </label>
          <FilterInput
            field={field}
            value={filters[field.name] ?? ''}
            onChange={(val) => onFilterChange(field.name, val)}
          />
        </div>
      ))}

      <div className="filter-bar__actions">
        <button
          id="filter-reset-btn"
          className="btn btn-secondary btn-sm"
          onClick={onReset}
          title="Reset all filters"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
}

function FilterInput({ field, value, onChange }) {
  if (field.type === 'SELECT' && (field.dataSource || field.source)?.type !== 'ENTITY') {
    const opts = field.options || [];
    return (
      <select
        id={`filter-${field.name}`}
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        {opts.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  if (field.type === 'BOOLEAN') {
    return (
      <select
        id={`filter-${field.name}`}
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }

  if (field.type === 'DATE' || field.type === 'DATETIME') {
    return (
      <input
        id={`filter-${field.name}`}
        type={field.type === 'DATE' ? 'date' : 'datetime-local'}
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <input
      id={`filter-${field.name}`}
      type="text"
      className="form-control"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Filter by ${field.label}`}
    />
  );
}
