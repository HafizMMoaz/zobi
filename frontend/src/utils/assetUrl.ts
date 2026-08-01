import { staticAssetsPrefix } from 'src/utils/getBootstrapData';

/**
 * Takes a string path to a static asset and prefixes it with the defined static asset prefix
 * defined in the bootstrap data
 * @param path A string path to a resource
 */
export function assetUrl(path: string): string {
  return `${staticAssetsPrefix()}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Returns the path prepended with the staticAssetsPrefix if the string is a relative path else it returns
 * the string as is.
 * @param url_or_path A url or relative path to a resource
 */
export function ensureStaticPrefix(url_or_path: string): string {
  if (url_or_path.startsWith('/')) return assetUrl(url_or_path);

  return url_or_path;
}
