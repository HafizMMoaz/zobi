import { JsonObject, LatestQueryFormData } from '@zobi.dev/core';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import type { ChartStatus, Datasource } from 'src/explore/types';

export enum ResultTypes {
  Results = 'results',
  Samples = 'samples',
}

type SetForceQueryAction = (force: boolean) => void;
export interface DataTablesPaneProps {
  queryFormData: LatestQueryFormData;
  datasource: Datasource;
  queryForce: boolean;
  ownState?: JsonObject;
  chartStatus: ChartStatus | null;
  onCollapseChange: (isOpen: boolean) => void;
  errorMessage?: React.ReactNode;
  setForceQuery: SetForceQueryAction;
  canDownload: boolean;
}

export interface ResultsPaneProps {
  isRequest: boolean;
  queryFormData: LatestQueryFormData;
  queryForce: boolean;
  ownState?: JsonObject;
  errorMessage?: React.ReactNode;
  setForceQuery?: SetForceQueryAction;
  dataSize?: number;
  // reload OriginalFormattedTimeColumns from localStorage when isVisible is true
  isVisible: boolean;
  canDownload: boolean;
  // Optional map of column/metric name -> verbose label
  columnDisplayNames?: Record<string, string>;
}

export interface SamplesPaneProps {
  isRequest: boolean;
  datasource: Datasource;
  queryFormData: LatestQueryFormData;
  queryForce: boolean;
  setForceQuery?: SetForceQueryAction;
  isVisible: boolean;
  canDownload: boolean;
}

export interface DrillControlsProps {
  onDownloadCSV?: () => void;
  onDownloadXLSX?: () => void;
  onReload?: () => void;
}

export interface TableControlsProps extends DrillControlsProps {
  data: Record<string, any>[];
  // {datasource.id}__{datasource.type}, eg: 1__table
  datasourceId?: string;
  onInputChange: (input: string) => void;
  columnNames: string[];
  columnTypes: GenericDataType[];
  isLoading: boolean;
  rowcount: number;
  canDownload: boolean;
  rowLimit?: number;
  rowLimitOptions?: { value: number; label: string }[];
  onRowLimitChange?: (limit: number) => void;
}

export interface QueryResultInterface {
  colnames: string[];
  coltypes: GenericDataType[];
  rowcount: number;
  data: Record<string, any>[][];
}

export interface SingleQueryResultPaneProp
  extends QueryResultInterface, DrillControlsProps {
  // {datasource.id}__{datasource.type}, eg: 1__table
  datasourceId?: string;
  isVisible: boolean;
  canDownload: boolean;
  // Optional map of column/metric name -> verbose label
  columnDisplayNames?: Record<string, string>;
  rowLimit?: number;
  rowLimitOptions?: { value: number; label: string }[];
  onRowLimitChange?: (limit: number) => void;
}
