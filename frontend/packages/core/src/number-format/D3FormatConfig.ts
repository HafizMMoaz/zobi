import { FormatLocaleDefinition } from 'd3-format';

export const DEFAULT_D3_FORMAT: FormatLocaleDefinition = {
  decimal: '.',
  thousands: ',',
  grouping: [3],
  currency: ['$', ''],
  minus: '-', // Use ASCII hyphen for backward compatibility (d3-format v3 defaults to Unicode minus sign)
};
