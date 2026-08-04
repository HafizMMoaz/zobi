/**
 * Placeholder datasource metadata for stories that render without a backend.
 *
 * `ChartProps` accepts the raw (snake_case) datasource and camel-cases it
 * itself, so the keys here deliberately match the API shape rather than the
 * `Datasource` interface. Legacy plugins read `verbose_map` and
 * `column_formats` unconditionally, so those must exist as empty objects - a
 * missing key throws where an empty one renders the column name verbatim.
 */
const dummyDatasource = {
  id: 1,
  name: 'dummy',
  datasource_name: 'dummy',
  type: 'table',
  columns: [],
  metrics: [],
  column_formats: {},
  currency_formats: {},
  verbose_map: {},
  main_dttm_col: '',
  time_grain_sqla: [],
  order_by_choices: [],
  description: null,
};

export default dummyDatasource;
