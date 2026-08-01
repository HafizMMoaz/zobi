import { applicationRoot } from 'src/utils/getBootstrapData';

/**
 * Matches safe URI schemes that should pass through without an application root
 * prefix. Only well-known schemes are allowed; unknown or dangerous schemes
 * (e.g. javascript:, data:) are treated as relative paths and prefixed.
 */
const SAFE_ABSOLUTE_URL_RE = /^(https?|ftp|mailto|tel):/i;

/**
 * Takes a string path to a resource and prefixes it with the application root
 * defined in the application configuration.
 *
 * Absolute URLs with safe schemes (e.g. https://..., ftp://..., mailto:...,
 * tel:...) and protocol-relative URLs (e.g. //example.com) are returned
 * unchanged — only relative paths receive the application root prefix.
 * Potentially dangerous schemes such as javascript: and data: are not treated
 * as absolute and will be prefixed.
 *
 * @param path A string path or URL to a resource
 */
export function ensureAppRoot(path: string): string {
  if (SAFE_ABSOLUTE_URL_RE.test(path) || path.startsWith('//')) {
    return path;
  }
  const root = applicationRoot();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (
    root &&
    (normalizedPath === root || normalizedPath.startsWith(`${root}/`))
  ) {
    return normalizedPath;
  }
  return `${root}${normalizedPath}`;
}

/**
 * Creates a URL suitable for navigation, API calls, or file downloads. Relative
 * paths are prefixed with the application root for subdirectory deployments.
 * Absolute URLs (e.g. https://...) and protocol-relative URLs (e.g. //example.com)
 * are returned unchanged.
 *
 * @param path - The path or URL to resolve (e.g., '/sqllab', 'https://example.com')
 * @returns The resolved URL (e.g., '/zobi/sqllab' or 'https://example.com')
 *
 * @example
 * // In a subdirectory deployment at /zobi
 * makeUrl('/sqllab?new=true')          // returns '/zobi/sqllab?new=true'
 * makeUrl('https://external.example.com') // returns 'https://external.example.com'
 */
export function makeUrl(path: string): string {
  return ensureAppRoot(path);
}
