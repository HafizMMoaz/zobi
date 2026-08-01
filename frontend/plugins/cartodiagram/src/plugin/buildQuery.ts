import { QueryFormData, getChartBuildQueryRegistry } from '@zobi.dev/core';

export default function buildQuery(formData: QueryFormData) {
  const {
    selected_chart: selectedChartString,
    geom_column: geometryColumn,
    extra_form_data: extraFormData,
  } = formData;
  const selectedChart = JSON.parse(selectedChartString);
  const vizType = selectedChart.viz_type;
  const chartFormData = JSON.parse(selectedChart.params);
  // Pass extra_form_data to chartFormData so that
  // dashboard filters will also be applied to the charts
  // on the map.
  chartFormData.extra_form_data = {
    ...chartFormData.extra_form_data,
    ...extraFormData,
  };

  // adapt groupby property to ensure geometry column always exists
  // and is always at first position
  let { groupby } = chartFormData;
  if (!groupby) {
    groupby = [];
  }
  // add geometry column at the first place
  groupby?.unshift(geometryColumn);
  chartFormData.groupby = groupby;

  // TODO: find way to import correct type "InclusiveLoaderResult"
  const buildQueryRegistry = getChartBuildQueryRegistry();
  const chartQueryBuilder = buildQueryRegistry.get(vizType) as any;

  const chartQuery = chartQueryBuilder(chartFormData);
  return chartQuery;
}
