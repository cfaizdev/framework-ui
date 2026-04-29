import React, { useState, useEffect } from 'react';
import dfClient from '../../api/dfClient';

/**
 * CascadeSelect — handles SELECT fields with source.type = ENTITY.
 * If source.dependsOn is set, re-fetches when the parent field value changes.
 */
export default function CascadeSelect({ field, servicePrefix, value, onChange, formValues, error }) {
  const source = field.dataSource || field.source;
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // API returns "" for no cascade dependency — treat it as falsy
  const hasDependsOn = !!(source?.dependsOn && source.dependsOn.trim());
  const dependsOnValue = hasDependsOn ? formValues[source.dependsOn] : null;

  useEffect(() => {
    if (!source?.entity || !servicePrefix) return;

    // If cascaded and parent has no value yet, clear options
    if (hasDependsOn && !dependsOnValue) {
      setOptions([]);
      return;
    }

    setLoading(true);
    const params = {};
    if (hasDependsOn && source.dependsOnParam) {
      params[source.dependsOnParam] = dependsOnValue;
    }

    // Gateway route: /{service}/df/{entity}
    dfClient.get(`/${servicePrefix}/df/${source?.entity}`, { params: { size: 200, ...params } })
      .then((res) => {
        const content = res.data?.content || [];
        const mapped = content.map((row) => ({
          label: row.data?.[source.labelField] || row.id,
          value: source.valueField === 'id' ? row.id : row.data?.[source.valueField],
        }));
        setOptions(mapped);
      })
      .catch(() => setOptions([]))
      .finally(() => setLoading(false));
  }, [source?.entity, servicePrefix, source?.dependsOn, source?.dependsOnParam, source?.labelField, source?.valueField, dependsOnValue]);

  return (
    <select
      id={`field-${field.name}`}
      className={`form-control ${error ? 'error' : ''}`}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading || (hasDependsOn && !dependsOnValue)}
    >
      <option value="">
        {loading ? 'Loading…' : hasDependsOn && !dependsOnValue
          ? `Select ${source.dependsOn} first`
          : `Select ${field.label}`}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
