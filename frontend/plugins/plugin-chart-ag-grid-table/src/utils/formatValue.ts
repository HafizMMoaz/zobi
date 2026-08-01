import {
  CurrencyFormatter,
  DataRecordValue,
  getNumberFormatter,
  isDefined,
  isProbablyHTML,
  sanitizeHtml,
} from '@zobi-ui/core';
import { GenericDataType } from '@zobi/core/common';
import {
  ValueFormatterParams,
  ValueGetterParams,
} from '@zobi-ui/core/components/ThemedAgGridReact';
import { DataColumnMeta, InputColumn } from '../types';
import DateWithFormatter from './DateWithFormatter';

/**
 * Format text for cell value.
 */
function formatValue(
  formatter: DataColumnMeta['formatter'],
  value: DataRecordValue,
): [boolean, string] {
  // render undefined as empty string
  if (value === undefined) {
    return [false, ''];
  }
  // render null as `N/A`
  if (
    value === null ||
    // null values in temporal columns are wrapped in a Date object, so make sure we
    // handle them here too
    (value instanceof DateWithFormatter && value.input === null)
  ) {
    return [false, 'N/A'];
  }
  if (formatter) {
    return [false, formatter(value as number)];
  }
  if (typeof value === 'string') {
    return isProbablyHTML(value) ? [true, sanitizeHtml(value)] : [false, value];
  }
  return [false, value.toString()];
}

export function formatColumnValue(
  column: DataColumnMeta,
  value: DataRecordValue,
) {
  const { dataType, formatter, config = {} } = column;
  const isNumber = dataType === GenericDataType.Numeric;
  const smallNumberFormatter =
    config.d3SmallNumberFormat === undefined
      ? formatter
      : config.currencyFormat
        ? new CurrencyFormatter({
            d3Format: config.d3SmallNumberFormat,
            currency: config.currencyFormat,
          })
        : getNumberFormatter(config.d3SmallNumberFormat);
  return formatValue(
    isNumber && typeof value === 'number' && Math.abs(value) < 1
      ? smallNumberFormatter
      : formatter,
    value,
  );
}

export const valueFormatter = (
  params: ValueFormatterParams,
  col: InputColumn,
): string => {
  const { value, node } = params;
  if (
    isDefined(value) &&
    value !== '' &&
    !(value instanceof DateWithFormatter && value.input === null)
  ) {
    return col.formatter?.(value) || value;
  }
  if (node?.level === -1) {
    return '';
  }
  return 'N/A';
};

export const valueGetter = (params: ValueGetterParams, col: InputColumn) => {
  // @ts-expect-error
  if (params?.colDef?.isMain) {
    const modifiedColId = `Main ${params.column.getColId()}`;
    return params.data[modifiedColId];
  }
  if (isDefined(params.data?.[params.column.getColId()])) {
    return params.data[params.column.getColId()];
  }
  if (col.isNumeric) {
    return undefined;
  }
  return '';
};
