import { ReactNode } from 'react';

import type { AgGridReactProps } from 'ag-grid-react';
import { GridSize } from './constants';

export type ColDef = {
  type: string;
  field: string;
};

export interface TableProps<RecordType> {
  /**
   * Data that will populate the each row and map to the column key.
   */
  data: RecordType[];
  /**
   * Table column definitions.
   */
  columns: {
    label: string;
    headerName?: string;
    width?: number;
    comparator?: (valueA: string | number, valueB: string | number) => number;
    render?: (value: any) => ReactNode;
  }[];

  size?: GridSize;

  externalFilter?: AgGridReactProps['doesExternalFilterPass'];

  height: number;

  columnReorderable?: boolean;

  sortable?: boolean;

  enableActions?: boolean;

  showRowNumber?: boolean;

  usePagination?: boolean;

  striped?: boolean;
}
