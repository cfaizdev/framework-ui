import React, { useState, useCallback } from 'react';
import { useSchema } from '../hooks/useSchema';
import { useRecords } from '../hooks/useRecords';
import { useToast } from '../hooks/useToast';
import FilterBar from '../components/entity/FilterBar';
import EntityTable from '../components/entity/EntityTable';
import EntityFormModal from '../components/entity/EntityFormModal';
import HistoryModal from '../components/entity/HistoryModal';
import { ToastContainer } from '../components/ui/Toast';
import { SpinnerCenter } from '../components/ui/Spinner';
import dfClient from '../api/dfClient';
import { entityIcon } from '../utils/tokenResolver';

export default function EntityPage({ entityName, schemas = [] }) {
  const activeSchemaInfo = schemas.find(s => s.entityName === entityName);
  const servicePrefix = activeSchemaInfo?.servicePrefix;

  const { schema, loading: schemaLoading, error: schemaError } = useSchema(entityName, servicePrefix);
  const { toasts, toast, removeToast } = useToast();

  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);

  const { data, loading: recordsLoading, error: recordsError, refresh } = useRecords(entityName, servicePrefix, filters, page, 20);

  // Modals
  const [formOpen, setFormOpen]       = useState(false);
  const [editRecord, setEditRecord]   = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRecord, setHistoryRecord] = useState(null);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const handleReset = () => {
    setFilters({});
    setPage(0);
  };

  const handleCreateClick = () => {
    setEditRecord(null);
    setFormOpen(true);
  };

  const handleEditClick = (record) => {
    setEditRecord(record);
    setFormOpen(true);
  };

  const handleHistoryClick = (record) => {
    setHistoryRecord(record);
    setHistoryOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      if (!servicePrefix) throw new Error('Service prefix not found');
      await dfClient.delete(`/${servicePrefix}/df/${entityName}/${id}`);
      toast.success('Record deleted successfully');
      refresh();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleFormSuccess = (msg) => {
    toast.success(msg);
    refresh();
  };

  if (schemaLoading) return <SpinnerCenter />;

  if (schemaError) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">⚠️</div>
        <div className="empty-state__title">Failed to load schema</div>
        <div className="empty-state__sub">{schemaError}</div>
      </div>
    );
  }

  if (!schema) return null;

  return (
    <div className="entity-page" id={`entity-page-${entityName}`}>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header__left">
          <h1>{entityIcon(entityName)} {schema.displayName}</h1>
          <p>
            {schema.tenantAware ? '🔒 Tenant-isolated' : '🌐 Global'}
            {schema.branchAware ? ' · 🏬 Branch-aware' : ''}
            {schema.auditEnabled ? ' · 📋 Audited' : ''}
            {' · '}{schema.fields?.length || 0} fields
          </p>
        </div>
        <button
          id={`create-${entityName}-btn`}
          className="btn btn-primary"
          onClick={handleCreateClick}
        >
          + New {schema.displayName}
        </button>
      </div>

      {/* Filter bar */ }
      <FilterBar
        schema={schema}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Error display for records */}
      {recordsError && (
        <div className="alert alert-danger" style={{ margin: '0 24px 24px' }}>
          <strong>Error:</strong> {recordsError}
        </div>
      )}

      {/* Table */}
      <EntityTable
        schema={schema}
        data={data}
        loading={recordsLoading}
        page={page}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onHistory={handleHistoryClick}
        onPageChange={setPage}
      />

      {/* Create / Edit Modal */}
      <EntityFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        schema={schema}
        record={editRecord}
        onSuccess={handleFormSuccess}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        entityName={entityName}
        servicePrefix={servicePrefix}
        record={historyRecord}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
