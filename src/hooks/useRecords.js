import { useState, useEffect, useCallback } from 'react';
import dfClient from '../api/dfClient';

export function useRecords(entityName, servicePrefix, filters = {}, page = 0, size = 20) {
  const [data, setData] = useState({ content: [], page: 0, size, totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecords = useCallback(() => {
    if (!entityName || !servicePrefix) return;
    setLoading(true);
    const params = { page, size, ...filters };
    // Remove empty strings
    Object.keys(params).forEach((k) => {
      if (params[k] === '' || params[k] === null || params[k] === undefined) {
        delete params[k];
      }
    });

    // Gateway route: /{service}/df/{entity}
    dfClient.get(`/${servicePrefix}/df/${entityName}`, { params })
      .then((res) => {
        setData(res.data);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Failed to load records'))
      .finally(() => setLoading(false));
  }, [entityName, servicePrefix, page, size, JSON.stringify(filters)]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return { data, loading, error, refresh: fetchRecords };
}
