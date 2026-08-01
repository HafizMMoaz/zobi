import { QueryFormColumn, QueryFormOrderBy } from '@zobi-ui/core';

/**
 * Builds orderby clauses from a list of columns, filtering out any non-string
 * or nullish values. This ensures deterministic row ordering so that chart
 * elements maintain stable positions across auto-refreshes.
 */
export function buildColumnsOrderBy(
  columns: (QueryFormColumn | string | undefined | null)[],
  ascending: boolean = true,
): QueryFormOrderBy[] {
  return columns
    .filter((col): col is string => typeof col === 'string' && col !== '')
    .map(col => [col, ascending]);
}

/**
 * Conditionally applies orderby to a query object spread. Returns the
 * orderby field only when row_limit is set (non-zero, non-null) and
 * there are orderby entries to apply.
 */
export function applyOrderBy(
  orderby: QueryFormOrderBy[],
  rowLimit: string | number | undefined | null,
): { orderby: QueryFormOrderBy[] } | Record<string, never> {
  const parsedRowLimit =
    typeof rowLimit === 'string' ? Number(rowLimit) : rowLimit;
  const shouldApply =
    rowLimit !== undefined &&
    rowLimit !== null &&
    (Number.isNaN(parsedRowLimit) || parsedRowLimit !== 0);
  return shouldApply && orderby.length > 0 ? { orderby } : {};
}
