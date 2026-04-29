import { useState, useEffect } from 'react';
import dfClient from '../api/dfClient';

const schemaCache = {};

export function useSchema(entityName, servicePrefix) {
  const cacheKey = servicePrefix ? `${servicePrefix}:${entityName}` : entityName;
  const [schema, setSchema] = useState(schemaCache[cacheKey] || null);
  const [loading, setLoading] = useState(!schemaCache[cacheKey]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!entityName || !servicePrefix) return;
    if (schemaCache[cacheKey]) {
      setSchema(schemaCache[cacheKey]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Gateway route: /{service}/df/schemas/{entity}
    dfClient.get(`/${servicePrefix}/df/schemas/${entityName}`)
      .then((res) => {
        res.data.servicePrefix = servicePrefix; // Inject prefix locally
        schemaCache[cacheKey] = res.data;
        setSchema(res.data);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Failed to load schema'))
      .finally(() => setLoading(false));
  }, [entityName, servicePrefix, cacheKey]);

  return { schema, loading, error };
}

export function useAllSchemas() {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Gateway aggregator endpoint
    dfClient.get('/df/schemas')
      .then((res) => {
        setSchemas(res.data || []);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Failed to load schemas'))
      .finally(() => setLoading(false));
  }, []);

  return { schemas, loading, error };
}
