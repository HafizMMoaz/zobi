
import { Page, APIResponse } from '@playwright/test';
import {
  apiGet,
  apiPost,
  apiDelete,
  apiPut,
  ApiRequestOptions,
} from './requests';

export const ENDPOINTS = {
  CHART: 'api/v1/chart/',
  CHART_EXPORT: 'api/v1/chart/export/',
} as const;

/**
 * TypeScript interface for chart creation API payload.
 * Only slice_name, datasource_id, datasource_type are required (ChartPostSchema).
 */
export interface ChartCreatePayload {
  slice_name: string;
  datasource_id: number;
  datasource_type: string;
  viz_type?: string;
  params?: string;
}

/**
 * POST request to create a chart
 * @param page - Playwright page instance (provides authentication context)
 * @param requestBody - Chart configuration object
 * @returns API response from chart creation
 */
export async function apiPostChart(
  page: Page,
  requestBody: ChartCreatePayload,
): Promise<APIResponse> {
  return apiPost(page, ENDPOINTS.CHART, requestBody);
}

/**
 * GET request to fetch a chart's details
 * @param page - Playwright page instance (provides authentication context)
 * @param chartId - ID of the chart to fetch
 * @param options - Optional request options
 * @returns API response with chart details
 */
export async function apiGetChart(
  page: Page,
  chartId: number,
  options?: ApiRequestOptions,
): Promise<APIResponse> {
  return apiGet(page, `${ENDPOINTS.CHART}${chartId}`, options);
}

/**
 * DELETE request to remove a chart
 * @param page - Playwright page instance (provides authentication context)
 * @param chartId - ID of the chart to delete
 * @param options - Optional request options
 * @returns API response from chart deletion
 */
export async function apiDeleteChart(
  page: Page,
  chartId: number,
  options?: ApiRequestOptions,
): Promise<APIResponse> {
  return apiDelete(page, `${ENDPOINTS.CHART}${chartId}`, options);
}

/**
 * PUT request to update a chart
 * @param page - Playwright page instance (provides authentication context)
 * @param chartId - ID of the chart to update
 * @param data - Partial chart payload (Marshmallow allows optional fields)
 * @param options - Optional request options
 * @returns API response from chart update
 */
export async function apiPutChart(
  page: Page,
  chartId: number,
  data: Record<string, unknown>,
  options?: ApiRequestOptions,
): Promise<APIResponse> {
  return apiPut(page, `${ENDPOINTS.CHART}${chartId}`, data, options);
}
