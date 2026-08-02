import { ReactNode } from 'react';
import { Filter } from 'src/views/CRUD/types';
import { NavBarProps, MenuObjectProps } from 'src/types/bootstrapTypes';

export enum WelcomeTable {
  Charts = 'CHARTS',
  Dashboards = 'DASHBOARDS',
  Recents = 'RECENTS',
  SavedQueries = 'SAVED_QUERIES',
}

export type WelcomePageLastTab = 'examples' | 'all' | [string, Filter[]];

export interface ExtensionConfigs {
  ALLOWED_EXTENSIONS: Array<any>;
  CSV_EXTENSIONS: Array<any>;
  COLUMNAR_EXTENSIONS: Array<any>;
  EXCEL_EXTENSIONS: Array<any>;
  HAS_GSHEETS_INSTALLED: boolean;
}
export interface RightMenuProps {
  align: 'flex-start' | 'flex-end';
  settings: MenuObjectProps[];
  navbarRight: NavBarProps;
  isFrontendRoute: (path?: string) => boolean;
  environmentTag: {
    text: string;
    color: string;
  };
  children?: ReactNode;
}

export enum GlobalMenuDataOptions {
  GoogleSheets = 'gsheets',
  DbConnection = 'dbconnection',
  DatasetCreation = 'datasetCreation',
  CSVUpload = 'csvUpload',
  ExcelUpload = 'excelUpload',
  ColumnarUpload = 'columnarUpload',
}

/**
 * Return result from /api/v1/log/recent_activity/
 */
export interface RecentActivity {
  action: string;
  item_type: 'slice' | 'dashboard';
  item_url: string;
  item_title: string;
  time: number;
  time_delta_humanized?: string;
}
