import { DatasourceType, NativeFilterScope } from '@zobi-ui/core';
import { Datasource } from 'src/dashboard/types';
import { DASHBOARD_ROOT_ID } from './util/constants';
export const PLACEHOLDER_DATASOURCE: Datasource = {
  id: 0,
  type: DatasourceType.Table,
  uid: '_placeholder_',
  datasource_name: '',
  table_name: '',
  columns: [],
  column_types: [],
  metrics: [],
  column_formats: {},
  verbose_map: {},
  main_dttm_col: '',
  description: '',
};

export const MAIN_HEADER_HEIGHT = 53;
export const CLOSED_FILTER_BAR_WIDTH = 32;
export const OPEN_FILTER_BAR_WIDTH = 260;
export const OPEN_FILTER_BAR_MAX_WIDTH = 550;
export const FILTER_BAR_HEADER_HEIGHT = 80;
export const FILTER_BAR_TABS_HEIGHT = 46;
export const BUILDER_SIDEPANEL_WIDTH = 374;
export const OVERWRITE_INSPECT_FIELDS = ['css', 'json_metadata.filter_scopes'];
export const EMPTY_CONTAINER_Z_INDEX = 10;

export const DEFAULT_CROSS_FILTER_SCOPING: NativeFilterScope = {
  rootPath: [DASHBOARD_ROOT_ID],
  excluded: [],
};

export const CHART_WIDTH = 4;
export const CHART_HEIGHT = 50;
