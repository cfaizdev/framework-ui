import React from 'react';
import { useAllSchemas } from '../../hooks/useSchema';
import { entityIcon } from '../../utils/tokenResolver';
import Spinner from '../ui/Spinner';
import UserMenu from './UserMenu';
import BranchSelector from './BranchSelector';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ activeEntity, onSelect, schemas = [], loading, error }) {
  const { auth } = useAuth();

  return (
    <aside className="sidebar" id="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">⚡</div>
        <div className="sidebar__logo-text">
          <span className="sidebar__logo-name">Dynamic Framework</span>
          <span className="sidebar__logo-sub">Admin Portal</span>
        </div>
      </div>

      {/* Branch Selector */}
      <BranchSelector />

      {/* Nav */}
      <nav className="sidebar__nav" aria-label="Entity navigation">
        <div className="sidebar__section-label">Entities</div>

        {loading && (
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
            <Spinner />
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--color-danger)' }}>
            ⚠ Failed to load schemas
          </div>
        )}

        {!loading && !error && schemas.length === 0 && (
          <div style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            No entities registered
          </div>
        )}

        {/* Group schemas by servicePrefix */}
        {!loading && !error && Object.entries(
          schemas.reduce((acc, schema) => {
            const prefix = schema.servicePrefix || 'System';
            if (!acc[prefix]) acc[prefix] = [];
            acc[prefix].push(schema);
            return acc;
          }, {})
        ).map(([service, serviceSchemas]) => (
          <div key={service} className="sidebar__service-group" style={{ marginBottom: '16px' }}>
            <div className="sidebar__service-header" style={{
              padding: '8px 16px',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontWeight: 'bold',
              letterSpacing: '0.05em'
            }}>
              {service}
            </div>
            {serviceSchemas.map((schema) => (
              <div
                key={schema.entityName}
                id={`sidebar-item-${schema.entityName}`}
                className={`sidebar__item ${activeEntity === schema.entityName ? 'active' : ''}`}
                onClick={() => onSelect(schema.entityName)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') onSelect(schema.entityName); }}
                aria-label={`Navigate to ${schema.displayName}`}
              >
                <span className="sidebar__item-icon">{schema.icon || entityIcon(schema.entityName)}</span>
                <span className="sidebar__item-name">{schema.displayName}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* User Menu at bottom */}
      <UserMenu />
    </aside>
  );
}
