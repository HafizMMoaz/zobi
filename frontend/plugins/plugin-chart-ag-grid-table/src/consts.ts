import { formatSelectOptions } from '@zobi-ui/chart-controls';

export const SERVER_PAGE_SIZE_OPTIONS = formatSelectOptions<number>([
  10, 20, 50, 100, 200,
]);

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200];

export const CUSTOM_AGG_FUNCS = {
  queryTotal: 'Metric total',
};

export const FILTER_POPOVER_OPEN_DELAY = 200;
export const FILTER_INPUT_SELECTOR = 'input[data-ref="eInput"]';
export const NOOP_FILTER_COMPARATOR = () => 0;

export const FILTER_INPUT_POSITIONS = {
  FIRST: 'first' as const,
  SECOND: 'second' as const,
  UNKNOWN: 'unknown' as const,
} as const;

export const FILTER_CONDITION_BODY_INDEX = {
  FIRST: 0,
  SECOND: 1,
} as const;
