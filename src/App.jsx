import React, { useState } from 'react';
import AppShell from './components/layout/AppShell';
import EntityPage from './pages/EntityPage';
import LoginPage from './pages/LoginPage';
import { useAllSchemas } from './hooks/useSchema';
import { useAuth } from './context/AuthContext';
import { entityIcon } from './utils/tokenResolver';

function WelcomeScreen() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', gap: 16, textAlign: 'center',
      padding: 40,
    }}>
      <div style={{ fontSize: '3rem' }}>⚡</div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Welcome to Dynamic Framework UI</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 420, fontSize: '0.9rem', lineHeight: 1.7 }}>
        Select an entity from the sidebar to view, create, filter, and manage records.
        Everything is auto-rendered from the schema — no hardcoded UI.
      </p>
      <div style={{
        marginTop: 16,
        padding: '14px 20px',
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        fontFamily: 'monospace',
      }}>
        GET /df/schemas → Sidebar built automatically
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const [activeEntity, setActiveEntity] = useState(null);
  const { schemas, loading, error } = useAllSchemas();

  const activeSchema = schemas.find((s) => s.entityName === activeEntity);

  return (
    <AppShell
      activeEntity={activeEntity}
      onSelectEntity={setActiveEntity}
      displayName={activeSchema ? `${activeSchema.icon || entityIcon(activeEntity)} ${activeSchema.displayName}` : null}
      schemas={schemas}
      loading={loading}
      error={error}
    >
      {activeEntity ? (
        <EntityPage key={activeEntity} entityName={activeEntity} schemas={schemas} />
      ) : (
        <WelcomeScreen />
      )}
    </AppShell>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <AuthenticatedApp />;
}
