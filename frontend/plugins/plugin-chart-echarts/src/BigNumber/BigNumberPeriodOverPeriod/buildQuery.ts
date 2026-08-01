import {
  buildQueryContext,
  QueryFormData,
  PostProcessingRule,
  ensureIsArray,
} from '@zobi-ui/core';
import {
  isTimeComparison,
  timeCompareOperator,
} from '@zobi-ui/chart-controls';
import { isEmpty } from 'lodash';

export default function buildQuery(formData: QueryFormData) {
  const { cols: groupby } = formData;

  const queryContextA = buildQueryContext(formData, baseQueryObject => {
    const postProcessing: PostProcessingRule[] = [];
    postProcessing.push(timeCompareOperator(formData, baseQueryObject));

    const nonCustomNorInheritShifts = ensureIsArray(
      formData.time_compare,
    ).filter((shift: string) => shift !== 'custom' && shift !== 'inherit');
    const customOrInheritShifts = ensureIsArray(formData.time_compare).filter(
      (shift: string) => shift === 'custom' || shift === 'inherit',
    );

    let timeOffsets: string[] = [];

    // Shifts for non-custom or non inherit time comparison
    if (!isEmpty(nonCustomNorInheritShifts)) {
      timeOffsets = nonCustomNorInheritShifts;
    }

    // Shifts for custom or inherit time comparison
    if (!isEmpty(customOrInheritShifts)) {
      if (customOrInheritShifts.includes('custom')) {
        timeOffsets = timeOffsets.concat([formData.start_date_offset]);
      }
      if (customOrInheritShifts.includes('inherit')) {
        timeOffsets = timeOffsets.concat(['inherit']);
      }
    }
    return [
      {
        ...baseQueryObject,
        groupby,
        post_processing: postProcessing,
        time_offsets: isTimeComparison(formData, baseQueryObject)
          ? ensureIsArray(timeOffsets)
          : [],
      },
    ];
  });

  return {
    ...queryContextA,
  };
}
