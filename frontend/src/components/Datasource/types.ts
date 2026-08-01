import type { ReactNode, DetailedHTMLProps, TdHTMLAttributes } from 'react';
import type { DatasetObject } from 'src/features/datasets/types';

export interface Datasource {
  type: string;
  id: number;
  uid: string;
}

export interface DatasourceModalProps {
  addSuccessToast: (msg: string) => void;
  addDangerToast: (msg: string) => void;
  datasource: DatasetObject;
  onChange: () => {};
  onDatasourceSave: (datasource: object, errors?: Array<any>) => {};
  onHide: () => {};
  show: boolean;
}

export interface ChangeDatasourceModalProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  onChange: (uid: string) => void;
  onDatasourceSave: (datasource: object, errors?: Array<any>) => {};
  onHide: () => void;
  show: boolean;
}

export interface CRUDCollectionProps {
  allowAddItem?: boolean;
  allowDeletes?: boolean;
  collection: Record<PropertyKey, any>[];
  columnLabels?: Record<PropertyKey, any>;
  columnLabelTooltips?: Record<PropertyKey, any>;
  emptyMessage?: ReactNode;
  expandFieldset?: ReactNode;
  extraButtons?: ReactNode;
  itemGenerator?: () => any;
  itemCellProps?: Record<
    string,
    (
      val: unknown,
      label: string,
      record: any,
    ) => DetailedHTMLProps<
      TdHTMLAttributes<HTMLTableCellElement>,
      HTMLTableCellElement
    >
  >;
  itemRenderers?: Record<
    string,
    (
      val: unknown,
      onChange: (value: unknown) => void,
      label: string,
      record: any,
    ) => ReactNode
  >;
  onChange?: (arg0: any) => void;
  tableColumns: any[];
  tableLayout?: 'fixed' | 'auto';
  sortColumns: string[];
  stickyHeader?: boolean;
  pagination?:
    | boolean
    | {
        pageSize?: number;
        showSizeChanger?: boolean;
        pageSizeOptions?: number[];
      };
  filterTerm?: string;
  filterFields?: string[];
}

export type Sort = number | string | boolean | any;

export enum SortOrder {
  Asc = 1,
  Desc = 2,
  Unsorted = 0,
}

export interface CRUDCollectionState {
  collection: Record<PropertyKey, any>;
  collectionArray: Record<PropertyKey, any>[];
  expandedColumns: Record<PropertyKey, any>;
  sortColumn: string;
  sort: SortOrder;
  currentPage: number;
  pageSize: number;
}

export enum FoldersEditorItemType {
  Folder = 'folder',
  Column = 'column',
  Metric = 'metric',
}
