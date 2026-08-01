import {
  DataRecordValue,
  NumberFormatter,
  QueryObjectFilterClause,
  TimeFormatter,
  ExtraFormData,
} from '@zobi.dev/core';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import { FALSE_STRING, NULL_STRING, TRUE_STRING } from 'src/utils/common';
import {
  Clauses,
  ExpressionTypes,
} from '../explore/components/controls/FilterControl/types';
import { SelectFilterOperatorType } from './components/Select/types';

function applyWildcard(
  value: string,
  operatorType: SelectFilterOperatorType,
): string {
  switch (operatorType) {
    case SelectFilterOperatorType.Contains:
      return `%${value}%`;
    case SelectFilterOperatorType.StartsWith:
      return `${value}%`;
    case SelectFilterOperatorType.EndsWith:
      return `%${value}`;
    default:
      return value;
  }
}

export const getSelectExtraFormData = (
  col: string,
  value?: null | (string | number | boolean | null)[],
  emptyFilter = false,
  shouldExcludeFilter = false,
  operatorType: SelectFilterOperatorType = SelectFilterOperatorType.Exact,
): ExtraFormData => {
  const extra: ExtraFormData = {};
  if (emptyFilter) {
    extra.adhoc_filters = [
      {
        expressionType: ExpressionTypes.Sql,
        clause: Clauses.Where,
        sqlExpression: '1 = 0',
      },
    ];
  } else if (value !== undefined && value !== null && value.length !== 0) {
    const isLikeOperator = operatorType !== SelectFilterOperatorType.Exact;

    if (isLikeOperator && typeof value[0] === 'string') {
      const wildcardVal = applyWildcard(value[0] as string, operatorType);
      extra.filters = [
        {
          col,
          op: shouldExcludeFilter ? ('NOT ILIKE' as const) : ('ILIKE' as const),
          val: wildcardVal,
        },
      ];
    } else {
      extra.filters = [
        {
          col,
          op: shouldExcludeFilter ? ('NOT IN' as const) : ('IN' as const),
          val: value,
        },
      ];
    }
  }
  return extra;
};

export const getRangeExtraFormData = (
  col: string,
  lower?: number | null,
  upper?: number | null,
) => {
  const filters: QueryObjectFilterClause[] = [];
  if (lower !== undefined && lower !== null && lower !== upper) {
    filters.push({ col, op: '>=', val: lower });
  }
  if (upper !== undefined && upper !== null && upper !== lower) {
    filters.push({ col, op: '<=', val: upper });
  }
  if (
    upper !== undefined &&
    upper !== null &&
    lower !== undefined &&
    lower !== null &&
    upper === lower
  ) {
    filters.push({ col, op: '==', val: upper });
  }

  return filters.length
    ? {
        filters,
      }
    : {};
};

export interface DataRecordValueFormatter {
  (value: DataRecordValue, dtype: GenericDataType): string;
}

export function getDataRecordFormatter({
  timeFormatter,
  numberFormatter,
}: {
  timeFormatter?: TimeFormatter;
  numberFormatter?: NumberFormatter;
} = {}): DataRecordValueFormatter {
  return (value, dtype) => {
    if (value === null || value === undefined) {
      return NULL_STRING;
    }
    if (typeof value === 'boolean') {
      return value ? TRUE_STRING : FALSE_STRING;
    }
    if (dtype === GenericDataType.Boolean) {
      try {
        return JSON.parse(String(value).toLowerCase())
          ? TRUE_STRING
          : FALSE_STRING;
      } catch {
        return FALSE_STRING;
      }
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'bigint') {
      return String(value);
    }
    if (timeFormatter && dtype === GenericDataType.Temporal) {
      return timeFormatter(value);
    }
    if (
      numberFormatter &&
      typeof value === 'number' &&
      dtype === GenericDataType.Numeric
    ) {
      return numberFormatter(value);
    }
    return String(value);
  };
}
