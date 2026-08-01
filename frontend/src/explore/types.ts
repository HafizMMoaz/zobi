import {
  QueryData,
  QueryFormData,
  AnnotationData,
  AdhocMetric,
  JsonObject,
  LatestQueryFormData,
} from '@zobi.dev/core';
import {
  ColumnMeta,
  ControlStateMapping,
  Dataset,
} from '@zobi.dev/chart-controls';
import { DatabaseObject } from 'src/views/CRUD/types';
import { UserWithPermissionsAndRoles } from 'src/types/bootstrapTypes';
import { Slice } from 'src/types/Chart';

export type SaveActionType = 'overwrite' | 'saveas';

export enum ChartStatusType {
  overwrite = 'overwrite',
  saveas = 'saveas',
}

export type ChartStatus =
  | 'loading'
  | 'rendered'
  | 'failed'
  | 'stopped'
  | 'success';

export interface ChartState {
  id: number;
  annotationData?: AnnotationData;
  annotationError?: Record<string, string>;
  annotationQuery?: Record<string, AbortController>;
  chartAlert: string | null;
  chartStatus: ChartStatus | null;
  chartStackTrace?: string | null;
  chartUpdateEndTime: number | null;
  chartUpdateStartTime: number;
  lastRendered: number;
  latestQueryFormData: LatestQueryFormData;
  sliceFormData: QueryFormData | null;
  queryController: AbortController | null;
  queriesResponse: QueryData[] | null;
  triggerQuery: boolean;
}

export type OptionSortType = Partial<
  ColumnMeta & AdhocMetric & { saved_metric_name: string }
>;

export type Datasource = Dataset & {
  database?: DatabaseObject;
  /** The parent resource that owns this datasource (database or semantic layer). */
  parent?: { name: string };
  datasource?: string;
  catalog?: string | null;
  schema?: string;
  is_sqllab_view?: boolean;
  extra?: string | object;
};

export interface ExplorePageInitialData {
  dataset: Dataset;
  form_data: QueryFormData;
  slice: Slice | null;
  metadata?: {
    created_on_humanized: string;
    changed_on_humanized: string;
    owners: string[];
    created_by?: string;
    changed_by?: string;
    color_namespace?: string;
    dashboards?: {
      id: number;
      dashboard_title: string;
    }[];
  };
  saveAction?: SaveActionType | null;
}

export interface ExploreResponsePayload {
  result: ExplorePageInitialData & {
    message: string;
    chartState?: JsonObject;
  };
}

export interface ExplorePageState {
  user: UserWithPermissionsAndRoles;
  common: {
    conf: JsonObject;
    locale: string;
  };
  charts: { [key: number]: ChartState };
  datasources: { [key: string]: Dataset };
  explore: {
    can_add: boolean;
    can_download: boolean;
    can_export_image: boolean;
    can_copy_clipboard: boolean;
    can_overwrite: boolean;
    isDatasourceMetaLoading: boolean;
    isStarred: boolean;
    triggerRender: boolean;
    // duplicate datasource in exploreState - it's needed by getControlsState
    datasource: Dataset;
    controls: ControlStateMapping;
    form_data: QueryFormData;
    hiddenFormData?: Partial<QueryFormData>;
    slice: Slice;
    controlsTransferred: string[];
    standalone: boolean;
    force: boolean;
    common: JsonObject;
    compatibleMetrics?: string[] | null;
    compatibleDimensions?: string[] | null;
    compatibilityLoading?: boolean;
  };
  sliceEntities?: JsonObject; // propagated from Dashboard view
}

export interface TabNode {
  value: string;
  title: string;
  parents: string[];
  children?: TabNode[];
}

export interface TabTreeNode {
  value: string;
  title: string;
  key: string;
  children?: TabTreeNode[];
}
