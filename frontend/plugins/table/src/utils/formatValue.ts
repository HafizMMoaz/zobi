import {
  CurrencyFormatter,
  DataRecordValue,
  getNumberFormatter,
  isProbablyHTML,
  sanitizeHtml,
} from '@zobi.dev/core';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import { DataColumnMeta } from '../types';
import DateWithFormatter from './DateWithFormatter';

/**
 * Format text for cell value.
 */
function formatValue(
  formatter: DataColumnMeta['formatter'],
  value: DataRecordValue,
  rowData?: Record<string, DataRecordValue>,
  currencyColumn?: string,
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
    // If formatter is a CurrencyFormatter, pass row context for AUTO mode
    if (formatter instanceof CurrencyFormatter) {
      return [false, formatter(value as number, rowData, currencyColumn)];
    }
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
  rowData?: Record<string, DataRecordValue>,
) {
  const { dataType, formatter, config = {}, currencyCodeColumn } = column;
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
    rowData,
    currencyCodeColumn,
  );
}
