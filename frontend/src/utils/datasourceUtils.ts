import { ColumnMeta } from '@zobi.dev/chart-controls';
import type { ISaveableDatasource } from 'src/SqlLab/components/SaveDatasetModal';

// Flexible interface that captures what this function actually needs to work
// This allows it to accept various datasource-like objects from different parts of the codebase
interface DatasourceInput {
  // Common properties that all datasource-like objects should have
  name?: string | null; // Allow null for compatibility

  // Optional properties that may exist on different datasource variants
  datasource_name?: string | null; // Allow null for compatibility
  columns?: any[]; // Can be ColumnMeta[], DatasourcePanelColumn[], ISimpleColumn[], etc.
  database?: { id?: number };
  dbId?: number;
  sql?: string | null; // Allow null for compatibility
  catalog?: string | null;
  schema?: string | null;
  templateParams?: string;

  // Type discriminator for QueryEditor-like objects
  version?: number;
}

export const getDatasourceAsSaveableDataset = (
  source: DatasourceInput,
): ISaveableDatasource => {
  // Type guard: QueryEditor-like objects have version property
  const isQueryEditorLike = typeof source.version === 'number';

  return {
    columns: (source.columns as ColumnMeta[]) || [],
    name: source.datasource_name || source.name || 'Untitled',
    dbId: source.database?.id || source.dbId || 0,
    sql: source.sql || '',
    catalog: source.catalog || null,
    schema: source.schema || null,
    templateParams: isQueryEditorLike ? source.templateParams || null : null,
  };
};
