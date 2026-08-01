import { DataRecordFilters } from '@zobi.dev/core';

export default function getEffectiveExtraFilters(filters: DataRecordFilters) {
  return Object.entries(filters)
    .map(([column, values]) => ({
      col: column,
      op: Array.isArray(values) ? 'IN' : '==',
      val: values,
    }))
    .filter(filter => filter.val !== null);
}
