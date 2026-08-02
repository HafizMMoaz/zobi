import { TimeLocaleDefinition } from 'd3-time-format';
import createMultiFormatter from '../factories/createMultiFormatter';

export const SMART_DATE_VERBOSE_ID = 'smart_date_verbose';

export function createSmartDateVerboseFormatter(locale?: TimeLocaleDefinition) {
  return createMultiFormatter({
    id: SMART_DATE_VERBOSE_ID,
    label: 'Verbose Adaptative Formatting',
    formats: {
      millisecond: '.%L',
      second: '%a %b %d, %I:%M:%S %p',
      minute: '%a %b %d, %I:%M %p',
      hour: '%a %b %d, %I %p',
      day: '%a %b %-e',
      week: '%a %b %-e',
      month: '%b %Y',
      year: '%Y',
    },
    locale,
  });
}
