import type { ColumnState, SortModelItem } from 'ag-grid-community';

// AG Grid filter type enums
export enum AgGridFilterType {
  Text = 'text',
  Number = 'number',
  Date = 'date',
  Set = 'set',
}

export enum AgGridTextFilterOperator {
  Equals = 'equals',
  NotEqual = 'notEqual',
  Contains = 'contains',
  NotContains = 'notContains',
  StartsWith = 'startsWith',
  EndsWith = 'endsWith',
  Blank = 'blank',
  NotBlank = 'notBlank',
}

export enum AgGridNumberFilterOperator {
  Equals = 'equals',
  NotEqual = 'notEqual',
  LessThan = 'lessThan',
  LessThanOrEqual = 'lessThanOrEqual',
  GreaterThan = 'greaterThan',
  GreaterThanOrEqual = 'greaterThanOrEqual',
  InRange = 'inRange',
  Blank = 'blank',
  NotBlank = 'notBlank',
}

export interface AgGridSortModel extends SortModelItem {
  sortIndex?: number;
}

export interface AgGridFilter {
  filterType?: string;
  type?: string;
  filter?: string | number;
  filterTo?: number;
  values?: string[];
  dateFrom?: string;
  dateTo?: string;
  operator?: 'AND' | 'OR';
  condition1?: AgGridFilter;
  condition2?: AgGridFilter;
  conditions?: AgGridFilter[];
}

export interface AgGridFilterModel {
  [colId: string]: AgGridFilter;
}

export interface AgGridChartState {
  columnState: ColumnState[];
  sortModel: AgGridSortModel[];
  filterModel: AgGridFilterModel;
  columnOrder?: string[];
  pageSize?: number;
  currentPage?: number;
}
