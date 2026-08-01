

import { t } from '@zobi/core-legacy/translation';

const VALIDE_OSM_URLS = ['https://tile.osm', 'https://tile.openstreetmap'];

/**
 * Validate a [Mapbox styles URL](https://docs.mapbox.com/help/glossary/style-url/)
 * @param v
 */
export default function validateMapboxStylesUrl(v: unknown): string | false {
  if (typeof v === 'string') {
    const trimmed_v = v.trim();
    if (
      typeof v === 'string' &&
      trimmed_v.length > 0 &&
      (trimmed_v.startsWith('mapbox://styles/') ||
        trimmed_v.startsWith('tile://http') ||
        VALIDE_OSM_URLS.some(s => trimmed_v.startsWith(s)))
    ) {
      return false;
    }
  }

  return t(
    'is expected to be a Mapbox/OSM URL (eg. mapbox://styles/...) or a tile server URL (eg. tile://http...)',
  );
}
