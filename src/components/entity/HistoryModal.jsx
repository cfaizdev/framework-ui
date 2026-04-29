import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import dfClient from '../../api/dfClient';

/**
 * HistoryModal — shows GET /df/{entity}/{id}/history as a timeline.
 */
export default function HistoryModal({ isOpen, onClose, entityName, servicePrefix, record }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !entityName || !record || !servicePrefix) return;
    setLoading(true);
    setError(null);
    dfClient.get(`/${servicePrefix}/df/${entityName}/${record.id}/history`)
      .then((res) => setHistory(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.message || 'Failed to load history'))
      .finally(() => setLoading(false));
  }, [isOpen, entityName, servicePrefix, record]);

  const recordLabel = record?.data
    ? Object.values(record.data).find((v) => typeof v === 'string' && v.length > 0) || record.id
    : record?.id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Audit History`}
      size="lg"
    >
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Record: <strong style={{ color: 'var(--text-secondary)' }}>{recordLabel}</strong>
          &nbsp;·&nbsp;ID: <code style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{record?.id}</code>
        </span>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', padding: '20px 0' }}>
          ⚠ {error}
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="empty-state" style={{ padding: '30px 0' }}>
          <div className="empty-state__icon">📜</div>
          <div className="empty-state__title">No audit history</div>
          <div className="empty-state__sub">Either audit is disabled or no changes have been recorded.</div>
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="history-timeline" id={`history-${record?.id}`}>
          {history.map((entry, idx) => (
            <HistoryEntry key={idx} entry={entry} />
          ))}
        </div>
      )}
    </Modal>
  );
}

function HistoryEntry({ entry }) {
  const [open, setOpen] = useState(true);
  const ACTION_ICONS = { CREATE: '✦', UPDATE: '✎', DELETE: '✕' };

  const date = entry.performedAt
    ? new Date(entry.performedAt).toLocaleString()
    : '—';

  const changes = entry.changes ? Object.entries(entry.changes) : [];

  return (
    <div className={`history-entry history-entry--${entry.action}`}>
      <div className="history-entry__dot">
        {ACTION_ICONS[entry.action] || '•'}
      </div>
      <div className="history-entry__body">
        <div className="history-entry__meta">
          <Badge value={entry.action} />
          {' '}by <strong>{entry.performedBy}</strong> on {date}
        </div>

        {changes.length > 0 && (
          <div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ padding: '2px 8px', fontSize: '0.72rem', marginBottom: 6 }}
              onClick={() => setOpen((p) => !p)}
            >
              {open ? '▾' : '▸'} {changes.length} field{changes.length !== 1 ? 's' : ''} changed
            </button>
            {open && (
              <table className="history-diff">
                <tbody>
                  {changes.map(([field, diff]) => (
                    <tr key={field}>
                      <td>{field}</td>
                      <td>
                        <span className="from">{String(diff.from ?? '—')}</span>
                        <span className="arrow"> → </span>
                        <span className="to">{String(diff.to ?? '—')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
