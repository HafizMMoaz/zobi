/**
 * All possible draggable items for the chart controls.
 */
export enum DndItemType {
  // an existing column in table
  Column = 'column',
  // a selected column option in ColumnSelectControl
  ColumnOption = 'columnOption',
  // an adhoc column option in ColumnSelectControl
  AdhocColumnOption = 'adhocColumn',

  // a saved metric
  Metric = 'metric',
  // a selected saved metric in MetricsControl
  MetricOption = 'metricOption',
  // an adhoc metric option in MetricsControl
  AdhocMetricOption = 'adhocMetric',

  // an adhoc filter option
  FilterOption = 'filterOption',
}
