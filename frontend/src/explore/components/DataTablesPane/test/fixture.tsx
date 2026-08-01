import { ReactElement } from 'react';
import { DatasourceType, VizType } from '@zobi-ui/core';
import { ChartStatus } from 'src/explore/types';
import {
  DataTablesPaneProps,
  SamplesPaneProps,
  ResultsPaneProps,
} from '../types';

const queryFormData = {
  viz_type: VizType.Heatmap,
  datasource: '34__table',
  slice_id: 456,
  url_params: {},
  time_range: 'Last week',
  all_columns_x: 'source',
  all_columns_y: 'target',
  metric: 'sum__value',
  adhoc_filters: [],
  row_limit: 10000,
  linear_color_scheme: 'blue_white_yellow',
  xscale_interval: null,
  yscale_interval: null,
  canvas_image_rendering: 'pixelated',
  normalize_across: 'heatmap',
  left_margin: 'auto',
  bottom_margin: 'auto',
  y_axis_bounds: [null, null],
  y_axis_format: 'SMART_NUMBER',
  show_perc: true,
  sort_x_axis: 'alpha_asc',
  sort_y_axis: 'alpha_asc',
  extra_form_data: {},
};

const datasource = {
  id: 34,
  name: '',
  type: DatasourceType.Table,
  columns: [],
  metrics: [],
  main_dttm_col: 'ds',
  column_formats: {},
  verbose_map: {},
  datasource_name: null,
  description: null,
};

export const createDataTablesPaneProps = (sliceId: number) =>
  ({
    queryFormData: {
      ...queryFormData,
      slice_id: sliceId,
    },
    datasource,
    queryForce: false,
    chartStatus: 'rendered' as ChartStatus,
    onCollapseChange: jest.fn(),
    setForceQuery: jest.fn(),
    canDownload: true,
  }) as DataTablesPaneProps;

export const createSamplesPaneProps = ({
  datasourceId,
  queryForce = false,
  isRequest = true,
}: {
  datasourceId: number;
  queryForce?: boolean;
  isRequest?: boolean;
}) =>
  ({
    isRequest,
    datasource: { ...datasource, id: datasourceId },
    queryFormData: {
      ...queryFormData,
      datasource: `${datasourceId}__table`,
    },
    queryForce,
    isVisible: true,
    setForceQuery: jest.fn(),
    canDownload: true,
  }) as SamplesPaneProps;

export const createResultsPaneOnDashboardProps = ({
  sliceId,
  errorMessage,
  vizType = VizType.Table,
  queryForce = false,
  isRequest = true,
}: {
  sliceId: number;
  vizType?: string;
  errorMessage?: ReactElement;
  queryForce?: boolean;
  isRequest?: boolean;
}) =>
  ({
    isRequest,
    queryFormData: {
      ...queryFormData,
      slice_id: sliceId,
      viz_type: vizType,
    },
    queryForce,
    isVisible: true,
    setForceQuery: jest.fn(),
    errorMessage,
    canDownload: true,
  }) as ResultsPaneProps;
