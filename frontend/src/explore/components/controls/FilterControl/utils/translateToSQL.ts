import {
  AdhocFilter,
  isFreeFormAdhocFilter,
  isSimpleAdhocFilter,
  SimpleAdhocFilter,
} from '@zobi-ui/core';
import {
  OPERATOR_ENUM_TO_OPERATOR_TYPE,
  Operators,
} from 'src/explore/constants';
import { getSimpleSQLExpression } from 'src/explore/exploreUtils';

export const OPERATORS_TO_SQL = {
  '==': '=',
  '!=': '<>',
  '>': '>',
  '<': '<',
  '>=': '>=',
  '<=': '<=',
  IN: 'IN',
  'NOT IN': 'NOT IN',
  LIKE: 'LIKE',
  ILIKE: 'ILIKE',
  REGEX: 'REGEX',
  'IS NOT NULL': 'IS NOT NULL',
  'IS NULL': 'IS NULL',
  'IS TRUE': 'IS TRUE',
  'IS FALSE': 'IS FALSE',
  'LATEST PARTITION': ({
    datasource,
  }: {
    datasource: { schema: string; datasource_name: string };
  }) =>
    `= '{{ presto.latest_partition('${datasource.schema}.${datasource.datasource_name}') }}'`,
};

export const translateToSql = (
  adhocFilter: AdhocFilter,
  { useSimple }: { useSimple: boolean } = { useSimple: false },
) => {
  if (isSimpleAdhocFilter(adhocFilter) || useSimple) {
    const { subject, operator } = adhocFilter as SimpleAdhocFilter;
    const comparator =
      'comparator' in adhocFilter ? adhocFilter.comparator : undefined;
    const op =
      operator &&
      // 'LATEST PARTITION' supported callback only
      operator ===
        OPERATOR_ENUM_TO_OPERATOR_TYPE[Operators.LatestPartition].operation
        ? // @ts-expect-error TODO: fix missing operator type `NOT LIKE` and `TEMPORAL RANGE`
          // Also to fix type incompatibility between AdhocFilter and Latest Partition callback args.
          OPERATORS_TO_SQL[operator](adhocFilter)
        : // @ts-expect-error TODO: fix missing operator type `NOT LIKE` and `TEMPORAL RANGE`.
          OPERATORS_TO_SQL[operator];
    return getSimpleSQLExpression(subject, op, comparator);
  }
  if (isFreeFormAdhocFilter(adhocFilter)) {
    return adhocFilter.sqlExpression;
  }
  return '';
};
