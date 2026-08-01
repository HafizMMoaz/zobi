import { t } from '@zobi/core/translation';
import { ControlPanelSectionConfig, ControlSetRow } from '../types';
import {
  contributionModeControl,
  xAxisForceCategoricalControl,
  xAxisSortAscControl,
  xAxisSortControl,
} from '../shared-controls';

const controlsWithoutXAxis: ControlSetRow[] = [
  ['metrics'],
  ['groupby'],
  [contributionModeControl],
  ['adhoc_filters'],
  ['limit', 'group_others_when_limit_reached'],
  ['timeseries_limit_metric'],
  ['order_desc'],
  ['row_limit'],
  ['truncate_metric'],
  ['show_empty_columns'],
];

export const echartsTimeSeriesQuery: ControlPanelSectionConfig = {
  label: t('Query'),
  expanded: true,
  controlSetRows: [['x_axis'], ['time_grain_sqla'], ...controlsWithoutXAxis],
};

export const echartsTimeSeriesQueryWithXAxisSort: ControlPanelSectionConfig = {
  label: t('Query'),
  expanded: true,
  controlSetRows: [
    ['x_axis'],
    ['time_grain_sqla'],
    [xAxisForceCategoricalControl],
    [xAxisSortControl],
    [xAxisSortAscControl],
    ...controlsWithoutXAxis,
  ],
};
