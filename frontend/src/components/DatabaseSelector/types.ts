import type { ReactNode } from 'react';

export type DatabaseValue = {
  label: ReactNode;
  value: number;
  id: number;
  database_name: string;
  backend?: string;
  supports_schemas?: boolean;
};

export type DatabaseObject = {
  id: number;
  database_name: string;
  backend?: string;
  allow_multi_catalog?: boolean;
  supports_schemas?: boolean;
};

export interface DatabaseSelectorProps {
  db?: DatabaseObject | null;
  emptyState?: ReactNode;
  formMode?: boolean;
  getDbList?: (arg0: any) => void;
  handleError: (msg: string) => void;
  isDatabaseSelectEnabled?: boolean;
  onDbChange?: (db: DatabaseObject) => void;
  onEmptyResults?: (searchText?: string) => void;
  onCatalogChange?: (catalog?: string) => void;
  catalog?: string | null;
  onSchemaChange?: (schema?: string) => void;
  schema?: string;
  readOnly?: boolean;
  sqlLabMode?: boolean;
  onOpenModal?: () => void;
}
