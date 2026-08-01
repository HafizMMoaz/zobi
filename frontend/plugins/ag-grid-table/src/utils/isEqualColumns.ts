import { isEqualArray } from '@zobi.dev/core';
import { TableChartProps } from '../types';

export default function isEqualColumns(
  propsA: TableChartProps[],
  propsB: TableChartProps[],
) {
  const a = propsA[0];
  const b = propsB[0];
  return (
    a.datasource.columnFormats === b.datasource.columnFormats &&
    a.datasource.currencyFormats === b.datasource.currencyFormats &&
    a.datasource.verboseMap === b.datasource.verboseMap &&
    a.formData.tableTimestampFormat === b.formData.tableTimestampFormat &&
    a.formData.timeGrainSqla === b.formData.timeGrainSqla &&
    JSON.stringify(a.formData.columnConfig || null) ===
      JSON.stringify(b.formData.columnConfig || null) &&
    isEqualArray(a.formData.metrics, b.formData.metrics) &&
    isEqualArray(a.queriesData?.[0]?.colnames, b.queriesData?.[0]?.colnames) &&
    isEqualArray(a.queriesData?.[0]?.coltypes, b.queriesData?.[0]?.coltypes) &&
    JSON.stringify(a.formData.extraFilters || null) ===
      JSON.stringify(b.formData.extraFilters || null) &&
    JSON.stringify(a.formData.extraFormData || null) ===
      JSON.stringify(b.formData.extraFormData || null) &&
    JSON.stringify(a.rawFormData.column_config || null) ===
      JSON.stringify(b.rawFormData.column_config || null)
  );
}
