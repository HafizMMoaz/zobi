
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonArray = JsonValue[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JsonObject = { [member: string]: any };

export interface Slice {
  slice_id: number;
  form_data: {
    viz_type: string;
  };
}

export interface Dashboard {
  slices: Slice[];
}

const V1_PLUGINS = [
  'box_plot',
  'echarts_timeseries',
  'word_cloud',
  'pie',
  'table',
  'big_number',
  'big_number_total',
];
export const DASHBOARD_CHART_ALIAS_PREFIX = 'getChartData_';

export function isLegacyChart(vizType: string): boolean {
  return !V1_PLUGINS.includes(vizType);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isLegacyResponse(response: any): boolean {
  return !response.result;
}

export function getSliceIdFromRequestUrl(url: string) {
  const address = new URL(url);
  const query = address.searchParams.get('form_data');
  return query?.match(/\d+/)?.[0];
}

export function getChartDataRouteForSlice(slice: Slice) {
  const vizType = slice.form_data.viz_type;
  const isLegacy = isLegacyChart(vizType);
  const formData = encodeURIComponent(`{"slice_id":${slice.slice_id}}`);
  if (isLegacy) {
    return `**/zobi/explore_json/?*${formData}*`;
  }
  return `**/api/v1/chart/data?*${formData}*`;
}

export function getChartAlias(slice: Slice): string {
  const alias = `${DASHBOARD_CHART_ALIAS_PREFIX}${slice.slice_id}_${slice.form_data.viz_type}`;
  const route = getChartDataRouteForSlice(slice);
  cy.intercept('POST', route).as(alias);
  return `@${alias}`;
}

export function getChartAliases(slices: Slice[]): string[] {
  return Array.from(slices).map(getChartAlias);
}

export function interceptChart({
  sliceId,
  legacy = false,
  method = 'POST',
}: {
  sliceId?: number;
  legacy?: boolean;
  method?: 'POST' | 'GET';
}) {
  const urlBase = legacy ? '**/zobi/explore_json/' : '**/api/v1/chart/data';
  let url;
  if (sliceId) {
    const encodedFormData = encodeURIComponent(
      JSON.stringify({ slice_id: sliceId }),
    );
    url = `${urlBase}?form_data=${encodedFormData}*`;
  } else {
    url = `${urlBase}**`;
  }
  return cy.intercept(method, url);
}
