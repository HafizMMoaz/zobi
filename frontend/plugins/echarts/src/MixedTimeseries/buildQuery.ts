import {
  buildQueryContext,
  ensureIsArray,
  normalizeOrderBy,
  PostProcessingPivot,
  QueryFormData,
  QueryObject,
  isXAxisSet,
  getXAxisColumn,
} from '@zobi.dev/core';
import {
  pivotOperator,
  renameOperator,
  flattenOperator,
  isTimeComparison,
  timeComparePivotOperator,
  rollingWindowOperator,
  timeCompareOperator,
  resampleOperator,
} from '@zobi.dev/chart-controls';
import {
  retainFormDataSuffix,
  removeFormDataSuffix,
} from '../utils/formDataSuffix';

export default function buildQuery(formData: QueryFormData) {
  const baseFormData = {
    ...formData,
  };

  const formData1 = removeFormDataSuffix(baseFormData, '_b');
  const formData2 = retainFormDataSuffix(baseFormData, '_b');

  const queryContexts = [formData1, formData2].map(fd =>
    buildQueryContext(fd, baseQueryObject => {
      const queryObject = {
        ...baseQueryObject,
        columns: [
          ...(isXAxisSet(formData)
            ? ensureIsArray(getXAxisColumn(formData))
            : []),
          ...ensureIsArray(fd.groupby),
        ],
        series_columns: fd.groupby,
        ...(isXAxisSet(formData) ? {} : { is_timeseries: true }),
      };

      const pivotOperatorInRuntime: PostProcessingPivot = isTimeComparison(
        fd,
        queryObject,
      )
        ? timeComparePivotOperator(fd, queryObject)
        : pivotOperator(fd, queryObject);

      const tmpQueryObject = {
        ...queryObject,
        time_offsets: isTimeComparison(fd, queryObject) ? fd.time_compare : [],
        post_processing: [
          pivotOperatorInRuntime,
          resampleOperator(fd, queryObject),
          rollingWindowOperator(fd, queryObject),
          timeCompareOperator(fd, queryObject),
          renameOperator(fd, queryObject),
          flattenOperator(fd, queryObject),
        ],
      } as QueryObject;
      return [normalizeOrderBy(tmpQueryObject)];
    }),
  );

  return {
    ...queryContexts[0],
    queries: [...queryContexts[0].queries, ...queryContexts[1].queries],
  };
}
