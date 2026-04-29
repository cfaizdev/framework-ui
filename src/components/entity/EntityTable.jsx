import React, { useState } from 'react';
import Badge from '../ui/Badge';
import Pagination from '../ui/Pagination';
import Spinner from '../ui/Spinner';
import { formatCellValue } from '../../utils/tokenResolver';
import { useEntityLabels } from '../../hooks/useEntityLabels';

// Field types to exclude from table columns
const HIDDEN_TYPES = ['TEXTAREA', 'PASSWORD'];
const MAX_COLS = 7;

/**
 * EntityTable — auto-renders columns from schema.fields.
 * Excludes TEXTAREA and PASSWORD types. Caps at MAX_COLS visible columns.
 */
export default function EntityTable({
  schema,
  data,
  loading,
  onEdit,
  onDelete,
  onHistory,
  onPageChange,
  page,
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const tableFields = (schema?.fields || [])
    .filter((f) => !HIDDEN_TYPES.includes(f.type))
    .sort((a, b) => a.order - b.order)
    .slice(0, MAX_COLS);

  const records = data?.content || [];
  const showHistory = schema?.auditEnabled;

  // Resolve entity-reference UUIDs to their display labels
  const { resolveLabel } = useEntityLabels(schema?.fields || [], schema?.servicePrefix);

  const handleDeleteConfirm = (id) => {
    onDelete(id);
    setDeleteConfirmId(null);
  };

  const renderCell = (record, field) => {
    const raw = record.data?.[field.name];
    const src = field.dataSource || field.source;

    // ENTITY-sourced SELECT: resolve UUID → display label
    if (field.type === 'SELECT' && src?.type === 'ENTITY') {
      if (raw === null || raw === undefined || raw === '') return <span className="text-muted">—</span>;
      const label = resolveLabel(field.name, raw);
      // Show a subtle badge-style chip with the label; tooltip shows raw ID
      return (
        <span
          title={`ID: ${raw}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', padding: '2px 8px',
            fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: 160,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          🔗 {label}
        </span>
      );
    }

    const val = formatCellValue(raw, field.type);

    // Status-like static SELECT fields → Badge
    if (field.type === 'SELECT' && field.options?.length > 0) {
      if (raw === null || raw === undefined || raw === '') return <span className="text-muted">—</span>;
      return <Badge value={raw} />;
    }
    if (field.type === 'BOOLEAN') {
      return <span className={raw ? 'text-success' : 'text-muted'}>{val}</span>;
    }
    return <span title={String(raw ?? '')}>{val}</span>;
  };

  return (
    <div className="table-wrapper" id={`table-${schema?.entityName}`}>
      <div className="table-header">
        <span className="table-header__title">
          {schema?.displayName || schema?.entityName} records
        </span>
        <span className="table-header__count">{data?.totalElements ?? 0} total</span>
      </div>

      {loading ? (
        <SkeletonRows cols={tableFields.length + 1} />
      ) : records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📭</div>
          <div className="empty-state__title">No records found</div>
          <div className="empty-state__sub">Try adjusting your filters or create the first record.</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {tableFields.map((f) => (
                  <th key={f.name}>{f.label}</th>
                ))}
                <th style={{ width: 120, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  {tableFields.map((f) => (
                    <td key={f.name}>{renderCell(record, f)}</td>
                  ))}
                  <td>
                    {deleteConfirmId === record.id ? (
                      <div className="actions-cell">
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-danger)' }}>Sure?</span>
                        <button
                          id={`confirm-delete-${record.id}`}
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteConfirm(record.id)}
                        >✓</button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteConfirmId(null)}
                        >✕</button>
                      </div>
                    ) : (
                      <div className="actions-cell">
                        <button
                          id={`edit-${record.id}`}
                          className="btn btn-ghost btn-icon"
                          title="Edit record"
                          onClick={() => onEdit(record)}
                        >✏️</button>
                        {showHistory && (
                          <button
                            id={`history-${record.id}`}
                            className="btn btn-ghost btn-icon"
                            title="View audit history"
                            onClick={() => onHistory(record)}
                          >🕐</button>
                        )}
                        <button
                          id={`delete-${record.id}`}
                          className="btn btn-ghost btn-icon"
                          title="Delete record"
                          style={{ color: 'var(--color-danger)' }}
                          onClick={() => setDeleteConfirmId(record.id)}
                        >🗑️</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && (
        <Pagination
          page={page}
          totalPages={data?.totalPages || 0}
          totalElements={data?.totalElements || 0}
          size={data?.size || 20}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

function SkeletonRows({ cols }) {
  return (
    <table className="data-table">
      <tbody>
        {[...Array(6)].map((_, i) => (
          <tr key={i} className="skeleton-row">
            {[...Array(cols)].map((_, j) => (
              <td key={j}><div className="skeleton" style={{ width: j === cols - 1 ? 60 : '80%' }} /></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
