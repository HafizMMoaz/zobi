import {
  ControlPanelState,
  ControlSetItem,
  ControlState,
  sharedControls,
  Dataset,
  ColumnMeta,
  defineSavedMetrics,
} from '@zobi.dev/chart-controls';
import { t } from '@zobi.dev/extension-api/translation';
import { getQueryMode, isAggMode, validateAggControlValues } from './shared';

const percentMetrics: typeof sharedControls.metrics = {
  type: 'MetricsControl',
  label: t('Percentage metrics'),
  description: t(
    'Select one or many metrics to display, that will be displayed in the percentages of total. ' +
      'Percentage metrics will be calculated only from data within the row limit. ' +
      'You can use an aggregation function on a column or write custom SQL to create a percentage metric.',
  ),
  multi: true,
  visibility: isAggMode,
  resetOnHide: false,
  mapStateToProps: ({ datasource, controls }, controlState) => ({
    columns: datasource?.columns || [],
    savedMetrics: defineSavedMetrics(datasource),
    datasource,
    datasourceType: datasource?.type,
    queryMode: getQueryMode(controls),
    externalValidationErrors: validateAggControlValues(controls, [
      controls.groupby?.value,
      controls.metrics?.value,
      controlState?.value,
    ]),
  }),
  rerender: ['groupby', 'metrics'],
  default: [],
  validators: [],
};

const dndPercentMetrics = {
  ...percentMetrics,
  type: 'DndMetricSelect',
};

export const percentMetricsControlSetItem: ControlSetItem = {
  name: 'percent_metrics',
  config: {
    ...dndPercentMetrics,
  },
};

export const metricsControlSetItem: ControlSetItem = {
  name: 'metrics',
  override: {
    validators: [],
    visibility: isAggMode,
    mapStateToProps: (
      { controls, datasource, form_data }: ControlPanelState,
      controlState: ControlState,
    ) => ({
      columns: datasource?.columns[0]?.hasOwnProperty('filterable')
        ? (datasource as Dataset)?.columns?.filter(
            (c: ColumnMeta) => c.filterable,
          )
        : datasource?.columns,
      savedMetrics: defineSavedMetrics(datasource),
      // current active adhoc metrics
      selectedMetrics:
        form_data.metrics || (form_data.metric ? [form_data.metric] : []),
      datasource,
      externalValidationErrors: validateAggControlValues(controls, [
        controls.groupby?.value,
        controls.percent_metrics?.value,
        controlState.value,
      ]),
    }),
    rerender: ['groupby', 'percent_metrics'],
    resetOnHide: false,
  },
};

export const showTotalsControlSetItem: ControlSetItem = {
  name: 'show_totals',
  config: {
    type: 'CheckboxControl',
    label: t('Show summary'),
    default: false,
    description: t(
      'Show total aggregations of selected metrics. Note that row limit does not apply to the result.',
    ),
    visibility: isAggMode,
    resetOnHide: false,
  },
};
