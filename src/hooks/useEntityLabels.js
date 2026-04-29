import { useState, useEffect } from 'react';
import dfClient from '../api/dfClient';

/**
 * For any schema field with dataSource.type === 'ENTITY',
 * fetches the referenced entity's records and builds a
 * per-field  id → labelField  lookup map.
 *
 * Returns: { [fieldName]: { [id]: displayLabel } }
 */

const globalCache = {}; // entity → { id: label } — persisted across re-renders

export function useEntityLabels(fields, servicePrefix) {
  const [labelMap, setLabelMap] = useState({});

  useEffect(() => {
    if (!fields || fields.length === 0 || !servicePrefix) return;

    // Collect fields that reference another entity
    const entityFields = fields.filter((f) => {
      const src = f.dataSource || f.source;
      return src?.type === 'ENTITY' && src?.entity;
    });

    if (entityFields.length === 0) return;

    // Deduplicate by entity name so we only fetch each entity once
    const entityToFields = {}; 
    entityFields.forEach((f) => {
      const src = f.dataSource || f.source;
      if (!entityToFields[src.entity]) {
        entityToFields[src.entity] = [];
      }
      entityToFields[src.entity].push({
        fieldName: f.name,
        labelField: src.labelField || 'name',
      });
    });

    const fetchAll = Object.entries(entityToFields).map(([entity, refs]) => {
      const cacheKey = `${servicePrefix}:${entity}`;
      // Use cache if already fetched
      if (globalCache[cacheKey]) {
        return Promise.resolve({ entity, refs, records: globalCache[cacheKey] });
      }
      // Gateway route: /{service}/df/{entity}
      return dfClient
        .get(`/${servicePrefix}/df/${entity}`, { params: { size: 500, page: 0 } })
        .then((res) => {
          const idLabelMap = {};
          (res.data?.content || []).forEach((row) => {
            const label = row.data?.[refs[0].labelField] || row.id;
            idLabelMap[row.id] = label;
          });
          globalCache[cacheKey] = idLabelMap;
          return { entity, refs, records: idLabelMap };
        })
        .catch(() => ({ entity, refs, records: {} }));
    });

    Promise.all(fetchAll).then((results) => {
      const newMap = {};
      results.forEach(({ entity, refs }) => {
        const cacheKey = `${servicePrefix}:${entity}`;
        const idLabelMap = globalCache[cacheKey] || {};
        refs.forEach(({ fieldName }) => {
          newMap[fieldName] = idLabelMap;
        });
      });
      setLabelMap(newMap);
    });
  }, [fields, servicePrefix]);

  /**
   * Resolves a raw cell value for a given field name.
   * Returns the label if found, otherwise the raw value.
   */
  const resolveLabel = (fieldName, rawValue) => {
    if (!rawValue) return rawValue;
    return labelMap[fieldName]?.[rawValue] ?? rawValue;
  };

  return { labelMap, resolveLabel };
}
