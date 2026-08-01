import { formatSelectOptions } from '@zobi-ui/chart-controls';
import { t } from '@zobi/core/translation';

export const PAGE_SIZE_OPTIONS = formatSelectOptions<number>([
  [0, t('All')],
  10,
  20,
  50,
  100,
  200,
]);

export const SERVER_PAGE_SIZE_OPTIONS = formatSelectOptions<number>([
  10, 20, 50, 100, 200,
]);
