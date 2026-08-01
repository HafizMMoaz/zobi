import { useState, useEffect, useCallback, useMemo } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { ZobiClient } from '@zobi.dev/core';
import { logging } from '@zobi.dev/extension-api/utils';
import rison from 'rison';
import { addDangerToast } from 'src/components/MessageToasts/actions';
import { DatasetObject } from 'src/features/datasets/AddDataset/types';
import type { DatabaseObject } from 'src/components';

/**
 * Retrieves all pages of dataset results
 */
const useDatasetsList = (
  db:
    | (DatabaseObject & {
        owners: [number];
      })
    | undefined,
  schema: string | null | undefined,
) => {
  const [datasets, setDatasets] = useState<DatasetObject[]>([]);
  const supportsSchemas = db?.supports_schemas !== false;
  const encodedSchema = schema ? encodeURIComponent(schema) : null;

  const getDatasetsList = useCallback(async (filters: object[]) => {
    let results: DatasetObject[] = [];
    let page = 0;
    let count;

    // If count is undefined or less than results, we need to
    // asynchronously retrieve a page of dataset results
    while (count === undefined || results.length < count) {
      const queryParams = rison.encode_uri({ filters, page });
      try {
        // eslint-disable-next-line no-await-in-loop
        const response = await ZobiClient.get({
          endpoint: `/api/v1/dataset/?q=${queryParams}`,
        });

        // Reassign local count to response's count
        ({ count } = response.json);

        const {
          json: { result },
        } = response;

        results = [...results, ...result];

        page += 1;
      } catch (error) {
        addDangerToast(t('There was an error fetching dataset'));
        logging.error(t('There was an error fetching dataset'), error);
        break;
      }
    }

    setDatasets(results);
  }, []);

  useEffect(() => {
    const filters = [
      { col: 'database', opr: 'rel_o_m', value: db?.id },
      ...(supportsSchemas
        ? [{ col: 'schema', opr: 'eq', value: encodedSchema }]
        : []),
      { col: 'sql', opr: 'dataset_is_null_or_empty', value: true },
    ];

    if (db?.id !== undefined && (schema || !supportsSchemas)) {
      getDatasetsList(filters);
    }
  }, [db?.id, schema, encodedSchema, supportsSchemas, getDatasetsList]);

  const datasetNames = useMemo(
    () => datasets?.map(dataset => dataset.table_name),
    [datasets],
  );

  return { datasets, datasetNames };
};

export default useDatasetsList;
