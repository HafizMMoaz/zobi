import { BootstrapData } from 'src/types/bootstrapTypes';
import { DEFAULT_BOOTSTRAP_DATA } from 'src/constants';

let cachedBootstrapData: BootstrapData | null = null;

export default function getBootstrapData(): BootstrapData {
  if (cachedBootstrapData === null) {
    const appContainer = document.getElementById('app');
    const dataBootstrap = appContainer?.getAttribute('data-bootstrap');
    cachedBootstrapData = dataBootstrap
      ? JSON.parse(dataBootstrap)
      : DEFAULT_BOOTSTRAP_DATA;
  }
  // Add a fallback to ensure the returned value is always of type BootstrapData
  return cachedBootstrapData ?? DEFAULT_BOOTSTRAP_DATA;
}

const normalizePathWithFallback = (
  path: string | undefined,
  fallback: string,
): string => (path ?? fallback).replace(/\/$/, '');

const APPLICATION_ROOT_NO_TRAILING_SLASH = normalizePathWithFallback(
  getBootstrapData().common.application_root,
  DEFAULT_BOOTSTRAP_DATA.common.application_root,
);

const STATIC_ASSETS_PREFIX_NO_TRAILING_SLASH = normalizePathWithFallback(
  getBootstrapData().common.static_assets_prefix,
  DEFAULT_BOOTSTRAP_DATA.common.static_assets_prefix,
);

/**
 * @returns The configured application root
 */
export function applicationRoot(): string {
  return APPLICATION_ROOT_NO_TRAILING_SLASH;
}

/**
 * @returns The configured static assets prefix
 */
export function staticAssetsPrefix(): string {
  return STATIC_ASSETS_PREFIX_NO_TRAILING_SLASH;
}
