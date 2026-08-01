
import type { Page, Response } from '@playwright/test';

/**
 * HTTP methods enum for consistency
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

/**
 * Options for waitFor* functions
 */
interface WaitForResponseOptions {
  /** Optional timeout in milliseconds */
  timeout?: number;
  /** Match against URL pathname suffix instead of full URL includes (default: false) */
  pathMatch?: boolean;
}

/**
 * Normalize a path by removing trailing slashes
 */
function normalizePath(path: string): string {
  return path.replace(/\/+$/, '');
}

/**
 * Check if a URL matches a pattern
 * - String + pathMatch: pathname.endsWith(pattern) with trailing slash normalization
 * - String: url.includes(pattern)
 * - RegExp: pattern.test(url)
 */
function matchUrl(
  url: string,
  pattern: string | RegExp,
  pathMatch?: boolean,
): boolean {
  if (typeof pattern === 'string') {
    if (pathMatch) {
      const pathname = normalizePath(new URL(url).pathname);
      const normalizedPattern = normalizePath(pattern);
      return pathname.endsWith(normalizedPattern);
    }
    return url.includes(pattern);
  }
  return pattern.test(url);
}

/**
 * Generic helper to wait for a response matching URL pattern and HTTP method
 */
function waitForResponse(
  page: Page,
  urlPattern: string | RegExp,
  method: HttpMethod,
  options?: WaitForResponseOptions,
): Promise<Response> {
  const { pathMatch, ...waitOptions } = options ?? {};
  return page.waitForResponse(
    response =>
      matchUrl(response.url(), urlPattern, pathMatch) &&
      response.request().method() === method,
    waitOptions,
  );
}

/**
 * Wait for a GET response matching the URL pattern
 */
export function waitForGet(
  page: Page,
  urlPattern: string | RegExp,
  options?: WaitForResponseOptions,
): Promise<Response> {
  return waitForResponse(page, urlPattern, HTTP_METHODS.GET, options);
}

/**
 * Wait for a POST response matching the URL pattern
 */
export function waitForPost(
  page: Page,
  urlPattern: string | RegExp,
  options?: WaitForResponseOptions,
): Promise<Response> {
  return waitForResponse(page, urlPattern, HTTP_METHODS.POST, options);
}

/**
 * Wait for a PUT response matching the URL pattern
 */
export function waitForPut(
  page: Page,
  urlPattern: string | RegExp,
  options?: WaitForResponseOptions,
): Promise<Response> {
  return waitForResponse(page, urlPattern, HTTP_METHODS.PUT, options);
}

/**
 * Wait for a DELETE response matching the URL pattern
 */
export function waitForDelete(
  page: Page,
  urlPattern: string | RegExp,
  options?: WaitForResponseOptions,
): Promise<Response> {
  return waitForResponse(page, urlPattern, HTTP_METHODS.DELETE, options);
}

/**
 * Wait for a PATCH response matching the URL pattern
 */
export function waitForPatch(
  page: Page,
  urlPattern: string | RegExp,
  options?: WaitForResponseOptions,
): Promise<Response> {
  return waitForResponse(page, urlPattern, HTTP_METHODS.PATCH, options);
}
