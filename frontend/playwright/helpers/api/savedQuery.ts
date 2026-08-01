
import { Page, APIResponse } from '@playwright/test';
import { apiGet, apiDelete, ApiRequestOptions } from './requests';

const ENDPOINTS = {
  SAVED_QUERY: 'api/v1/saved_query/',
} as const;

/**
 * GET request to fetch a saved query's details
 */
export async function apiGetSavedQuery(
  page: Page,
  savedQueryId: number,
  options?: ApiRequestOptions,
): Promise<APIResponse> {
  return apiGet(page, `${ENDPOINTS.SAVED_QUERY}${savedQueryId}`, options);
}

/**
 * DELETE request to remove a saved query
 */
export async function apiDeleteSavedQuery(
  page: Page,
  savedQueryId: number,
  options?: ApiRequestOptions,
): Promise<APIResponse> {
  return apiDelete(page, `${ENDPOINTS.SAVED_QUERY}${savedQueryId}`, options);
}
