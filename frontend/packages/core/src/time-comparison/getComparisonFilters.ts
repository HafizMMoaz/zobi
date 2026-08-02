import { QueryFormData } from '../query';
import { AdhocFilter } from '../types';

/**
 * This method is used to get the query filters to be applied to the comparison query after
 * overriding the time range in case an extra form data is provided.
 * For example when rendering a chart that uses time comparison in a dashboard with time filters.
 * @param formData - the form data
 * @param extraFormData - the extra form data
 * @returns the query filters to be applied to the comparison query
 */
export const getComparisonFilters = (
  formData: QueryFormData,
  extraFormData: any,
): AdhocFilter[] => {
  const timeFilterIndex: number =
    formData.adhoc_filters?.findIndex(
      filter => 'operator' in filter && filter.operator === 'TEMPORAL_RANGE',
    ) ?? -1;

  const timeFilter: AdhocFilter | null =
    timeFilterIndex !== -1 && formData.adhoc_filters
      ? formData.adhoc_filters[timeFilterIndex]
      : null;

  if (
    timeFilter &&
    'comparator' in timeFilter &&
    typeof timeFilter.comparator === 'string'
  ) {
    if (extraFormData?.time_range) {
      timeFilter.comparator = extraFormData.time_range;
    }
  }

  const comparisonQueryFilter = timeFilter ? [timeFilter] : [];

  const otherFilters = formData.adhoc_filters?.filter(
    (_value: any, index: number) => timeFilterIndex !== index,
  );
  const comparisonQueryFilters = otherFilters
    ? [...comparisonQueryFilter, ...otherFilters]
    : comparisonQueryFilter;

  return comparisonQueryFilters;
};

export default getComparisonFilters;
