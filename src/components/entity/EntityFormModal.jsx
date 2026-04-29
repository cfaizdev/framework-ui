import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import DynamicField from './DynamicField';
import Spinner from '../ui/Spinner';
import dfClient from '../../api/dfClient';
import { buildInitialValues } from '../../utils/tokenResolver';
import { useAuth } from '../../context/AuthContext';

/**
 * EntityFormModal — auto-rendered Create / Edit form driven by schema.
 */
export default function EntityFormModal({ isOpen, onClose, schema, record, onSuccess }) {
  const { auth } = useAuth();
  const isEdit = !!record;

  const [values, setValues] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [saving, setSaving] = useState(false);

  // Sort fields by order
  const sortedFields = (schema?.fields || [])
    .filter((f) => f.type !== 'PASSWORD' || !isEdit) // hide password on edit (optional: show for change)
    .sort((a, b) => a.order - b.order);

  // Init form values
  useEffect(() => {
    if (!isOpen) return;
    setFieldErrors({});
    setGlobalError('');
    if (isEdit && record) {
      setValues({ ...record.data });
    } else {
      setValues(buildInitialValues(schema?.fields || [], auth.userName));
    }
  }, [isOpen, record, schema, isEdit, auth.userName]);

  const handleFieldChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setGlobalError('');
    setFieldErrors({});

    try {
      const entity = schema.entityName;
      const prefix = schema.servicePrefix; // Injected by Gateway aggregator
      
      if (isEdit) {
        await dfClient.put(`/${prefix}/df/${entity}/${record.id}`, values);
      } else {
        await dfClient.post(`/${prefix}/df/${entity}`, values);
      }
      onSuccess(isEdit ? 'Record updated successfully' : 'Record created successfully');
      onClose();
    } catch (err) {
      if (err.fieldErrors && err.fieldErrors.length > 0) {
        const map = {};
        err.fieldErrors.forEach((fe) => { map[fe.field] = fe.message; });
        setFieldErrors(map);
      }
      setGlobalError(err.message || 'Save failed. Please check the fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  const title = isEdit
    ? `Edit ${schema?.displayName}`
    : `New ${schema?.displayName}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <>
          {globalError && (
            <span style={{ fontSize: '0.78rem', color: 'var(--color-danger)', flex: 1 }}>
              ⚠ {globalError}
            </span>
          )}
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            id="form-submit-btn"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? <><Spinner size="sm" /> Saving…</> : (isEdit ? 'Update' : 'Create')}
          </button>
        </>
      }
    >
      <div id={`form-${schema?.entityName}`}>
        {sortedFields.map((field) => (
          <div key={field.name} className="form-group">
            <label className="form-label" htmlFor={`field-${field.name}`}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <DynamicField
              field={field}
              servicePrefix={schema.servicePrefix}
              value={values[field.name]}
              onChange={handleFieldChange}
              formValues={values}
              error={!!fieldErrors[field.name]}
            />
            {fieldErrors[field.name] && (
              <div className="form-error">⚠ {fieldErrors[field.name]}</div>
            )}
          </div>
        ))}

        {sortedFields.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
            No fields defined for this entity.
          </p>
        )}
      </div>
    </Modal>
  );
}
