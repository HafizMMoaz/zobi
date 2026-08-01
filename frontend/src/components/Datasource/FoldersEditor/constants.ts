
import {
  DatasourceFolder,
  DatasourceFolderItem,
} from 'src/explore/components/DatasourcePanel/types';
import { FoldersEditorItemType } from '../types';

// Default folder UUIDs
export const DEFAULT_METRICS_FOLDER_UUID =
  '255b537d-58c8-443d-9fc1-4e4dc75047e2';
export const DEFAULT_COLUMNS_FOLDER_UUID =
  '83a7ae8f-2e8a-4f2b-a8cb-ebaebef95b9b';

// Number of default folders (Metrics, Columns)
export const DEFAULT_FOLDERS_COUNT = 2;

// Drag & drop constants
export const DRAG_INDENTATION_WIDTH = 64;
export const MAX_DEPTH = 3;

// Base row height for tree items
export const ITEM_BASE_HEIGHT = 32;

// Type definitions
export type TreeItem = DatasourceFolder | DatasourceFolderItem;

export interface FlattenedTreeItem {
  uuid: string;
  type: FoldersEditorItemType;
  name: string;
  description?: string;
  children?: TreeItem[];
  parentId: string | null;
  depth: number;
  index: number;
  collapsed?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Helper functions
export const isDefaultFolder = (folderId: string): boolean =>
  folderId === DEFAULT_METRICS_FOLDER_UUID ||
  folderId === DEFAULT_COLUMNS_FOLDER_UUID;
