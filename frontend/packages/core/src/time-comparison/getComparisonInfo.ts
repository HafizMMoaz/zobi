
import { QueryFormData } from '../query';
import { getComparisonFilters } from './getComparisonFilters';
import { ComparisonTimeRangeType } from './types';

/**
 * This is the main function to get the comparison info. It will return the formData
 * that a viz can use to query the comparison data and the time shift text needed for
 * the comparison time range based on the control value.
 * @param formData
 * @param timeComparison
 * @param extraFormData
 * @returns the processed formData
 */

export const getComparisonInfo = (
  formData: QueryFormData,
  timeComparison: string,
  extraFormData: any,
): QueryFormData => {
  let comparisonFormData;

  if (timeComparison !== ComparisonTimeRangeType.Custom) {
    comparisonFormData = {
      ...formData,
      adhoc_filters: getComparisonFilters(formData, extraFormData),
      extra_form_data: {
        ...extraFormData,
        time_range: undefined,
      },
    };
  } else {
    // This is when user selects Custom as time comparison
    comparisonFormData = {
      ...formData,
      adhoc_filters: formData.adhoc_custom,
      extra_form_data: {
        ...extraFormData,
        time_range: undefined,
      },
    };
  }

  return comparisonFormData;
};

export default getComparisonInfo;
