import { ColumnMeta, Metric } from '@zobi-ui/chart-controls';
import { FoldersEditorItemType } from 'src/components/Datasource/types';
import { DndItemType } from '../DndItemType';

export type DndItemValue = ColumnMeta | Metric;

export interface DatasourcePanelDndItem {
  value: DndItemValue;
  type: DndItemType;
}

export function isDatasourcePanelDndItem(
  item: any,
): item is DatasourcePanelDndItem {
  return item?.value && item?.type;
}

export function isSavedMetric(item: any): item is Metric {
  return item?.metric_name;
}

export type DatasourcePanelColumn = {
  uuid: string;
  id?: number;
  is_dttm?: boolean | null;
  description?: string | null;
  expression?: string | null;
  is_certified?: number | null;
  column_name?: string | null;
  name?: string | null;
  type?: string;
};

export type DatasourceFolderItem = {
  type: FoldersEditorItemType.Column | FoldersEditorItemType.Metric;
  uuid: string;
  name: string;
};
export type DatasourceFolder = {
  uuid: string;
  type: FoldersEditorItemType.Folder;
  name: string;
  description?: string;
  children?: (DatasourceFolder | DatasourceFolderItem)[];
};

export type MetricItem = Metric & {
  type: FoldersEditorItemType.Metric;
};

export type ColumnItem = DatasourcePanelColumn & {
  type: FoldersEditorItemType.Column;
};

export type FolderItem = MetricItem | ColumnItem;

export interface Folder {
  id: string;
  name: string;
  description?: string;
  isCollapsed: boolean;
  items: FolderItem[];
  subFolders?: Folder[];
  parentId?: string;
  totalItems: number;
  showingItems: number; // items shown after filtering
}

export interface FlattenedItem {
  type: 'header' | 'item' | 'divider' | 'subtitle';
  folderId: string;
  depth: number;
  item?: FolderItem;
  height: number;
  totalItems?: number;
  showingItems?: number;
}
