/**
 * @fileoverview Authentication API for Zobi extensions.
 *
 * This module provides functions for handling user authentication and security
 * within Zobi extensions.
 */

/**
 * Retrieves the CSRF token used for securing requests against cross-site request forgery attacks.
 * This token should be included in the headers of POST, PUT, DELETE, and other state-changing
 * HTTP requests to ensure they are authorized.
 *
 * @returns A promise that resolves to the CSRF token as a string, or undefined if not available.
 *
 * @example
 * ```typescript
 * const csrfToken = await getCSRFToken();
 * if (csrfToken) {
 *   // Include in request headers
 *   headers['X-CSRFToken'] = csrfToken;
 * }
 * ```
 */
export declare function getCSRFToken(): Promise<string | undefined>;
