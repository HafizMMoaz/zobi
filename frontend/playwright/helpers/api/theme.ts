
import { Page, APIResponse } from '@playwright/test';
import { apiPost, apiDelete, ApiRequestOptions } from './requests';

export const ENDPOINTS = {
  THEME: 'api/v1/theme/',
} as const;

/**
 * TypeScript interface for theme creation API payload.
 * Both fields are required (ThemePostSchema).
 */
export interface ThemeCreatePayload {
  theme_name: string;
  json_data: string;
}

/**
 * POST request to create a theme
 * @param page - Playwright page instance (provides authentication context)
 * @param requestBody - Theme configuration object
 * @returns API response from theme creation
 */
export async function apiPostTheme(
  page: Page,
  requestBody: ThemeCreatePayload,
): Promise<APIResponse> {
  return apiPost(page, ENDPOINTS.THEME, requestBody);
}

/**
 * DELETE request to remove a theme
 * @param page - Playwright page instance (provides authentication context)
 * @param themeId - ID of the theme to delete
 * @param options - Optional request options
 * @returns API response from theme deletion
 */
export async function apiDeleteTheme(
  page: Page,
  themeId: number,
  options?: ApiRequestOptions,
): Promise<APIResponse> {
  return apiDelete(page, `${ENDPOINTS.THEME}${themeId}`, options);
}
