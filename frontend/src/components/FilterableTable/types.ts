export type CellDataType = string | number | null;
export type Datum = Record<string, CellDataType>;

export interface FilterableTableProps {
  orderedColumnKeys: string[];
  data: Record<string, unknown>[];
  height: number;
  filterText?: string;
  headerHeight?: number;
  overscanColumnCount?: number;
  overscanRowCount?: number;
  rowHeight?: number;
  striped?: boolean;
  expandedColumns?: string[];
  allowHTML?: boolean;
}
