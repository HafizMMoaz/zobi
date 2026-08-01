import { useEffect, useState, useRef } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { ZobiClient } from '@zobi.dev/core';
import { logging } from '@zobi.dev/extension-api/utils';
import { DatasetObject } from 'src/features/datasets/AddDataset/types';
import { addDangerToast } from 'src/components/MessageToasts/actions';
import { type DatabaseObject } from 'src/components';
import { toQueryString } from 'src/utils/urlUtils';
import DatasetPanel from './DatasetPanel';
import { ITableColumn, IDatabaseTable, isIDatabaseTable } from './types';

/**
 * Interface for the getTableMetadata API call
 */
interface IColumnProps {
  /**
   * Unique id of the database
   */
  dbId: number;
  /**
   * Name of the table
   */
  tableName: string;
  /**
   * Name of the schema (optional for databases that don't support schemas)
   */
  schema?: string | null;
}

export interface IDatasetPanelWrapperProps {
  /**
   * Name of the database table
   */
  tableName?: string | null;
  /**
   * Database ID
   */
  dbId?: number;
  /**
   * The selected catalog/schema for the database
   */
  catalog?: string | null;
  schema?: string | null;
  /**
   * The selected database object (used to check engine capabilities)
   */
  database?: Partial<DatabaseObject> | null;
  setHasColumns?: Function;
  datasets?: DatasetObject[] | undefined;
}

const DatasetPanelWrapper = ({
  tableName,
  dbId,
  catalog,
  schema,
  database,
  setHasColumns,
  datasets,
}: IDatasetPanelWrapperProps) => {
  const [columnList, setColumnList] = useState<ITableColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const tableNameRef = useRef(tableName);

  const getTableMetadata = async (props: IColumnProps) => {
    const { dbId, tableName, schema } = props;
    setLoading(true);
    setHasColumns?.(false);
    const path = `/api/v1/database/${dbId}/table_metadata/${toQueryString({
      name: tableName,
      catalog,
      schema,
    })}`;
    try {
      const response = await ZobiClient.get({
        endpoint: path,
      });

      if (isIDatabaseTable(response?.json)) {
        const table: IDatabaseTable = response.json as IDatabaseTable;
        /**
         *  The user is able to click other table columns while the http call for last selected table column is made
         *  This check ensures we process the response that matches the last selected table name and ignore the others
         */
        if (table.name === tableNameRef.current) {
          setColumnList(table.columns);
          setHasColumns?.(table.columns.length > 0);
          setHasError(false);
        }
      } else {
        setColumnList([]);
        setHasColumns?.(false);
        setHasError(true);
        addDangerToast(
          t(
            'The API response from %s does not match the IDatabaseTable interface.',
            path,
          ),
        );
        logging.error(
          t(
            'The API response from %s does not match the IDatabaseTable interface.',
            path,
          ),
        );
      }
    } catch (error) {
      setColumnList([]);
      setHasColumns?.(false);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    tableNameRef.current = tableName;
    const schemaRequired = database?.supports_schemas !== false;
    if (tableName && dbId && (schema || !schemaRequired)) {
      getTableMetadata({ tableName, dbId, schema: schema || undefined });
    }
    // getTableMetadata is a const and should not be in dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName, dbId, schema, database]);

  return (
    <DatasetPanel
      columnList={columnList}
      hasError={hasError}
      loading={loading}
      tableName={tableName}
      datasets={datasets}
    />
  );
};

export default DatasetPanelWrapper;
