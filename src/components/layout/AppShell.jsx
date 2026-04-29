import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { entityIcon } from '../../utils/tokenResolver';

export default function AppShell({ activeEntity, onSelectEntity, children, displayName, schemas, loading, error }) {
  const { auth } = useAuth();

  return (
    <div className="app-shell" id="app-shell">
      <aside className="sidebar" style={{ gridArea: 'sidebar' }}>
        <Sidebar activeEntity={activeEntity} onSelect={onSelectEntity} schemas={schemas} loading={loading} error={error} />
      </aside>

      {/* Topbar */}
      <header className="topbar" id="topbar">
        <div className="topbar__breadcrumb">
          <span>Dynamic Framework</span>
          {activeEntity && (
            <>
              <span className="sep">›</span>
              <span className="active">
                {entityIcon(activeEntity)}&nbsp;{displayName || activeEntity}
              </span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {auth && (
            <span className="topbar__user-badge">
              {auth.userName} · {auth.roles?.join(', ')}
            </span>
          )}
          <span>v1.0.0</span>
        </div>
      </header>

      {/* Main */}
      <main className="main-content" id="main-content">
        {children}
      </main>
    </div>
  );
}
