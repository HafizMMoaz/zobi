import type { ColumnKeyTypeType } from 'src/SqlLab/components/ColumnElement';

export interface TreeNodeData {
  id: string;
  name: string;
  type: 'schema' | 'table' | 'column' | 'empty';
  tableType?: string;
  columnData?: {
    name: string;
    keys?: { type: ColumnKeyTypeType }[];
    type: string;
  };
  children?: TreeNodeData[];
  disableCheckbox?: boolean;
}

export interface FetchLazyTablesParams {
  dbId: string | number;
  catalog: string | null | undefined;
  schema: string;
  forceRefresh: boolean;
}
