import {
  ZobiClient,
  getTimeFormatter,
  TimeFormats,
  ensureIsArray,
  JsonObject,
} from '@zobi.dev/core';

// ATTENTION: If you change any constants, make sure to also change constants.py

export const EMPTY_STRING = '<empty string>';
export const NULL_STRING = '<NULL>';
export const TRUE_STRING = 'TRUE';
export const FALSE_STRING = 'FALSE';

// dayjs time format strings
export const SHORT_DATE = 'MMM D, YYYY';
export const SHORT_TIME = 'h:m a';

const DATETIME_FORMATTER = getTimeFormatter(TimeFormats.DATABASE_DATETIME);

export type OptionValue = string | number | boolean | null;

export interface OptionItem {
  value: OptionValue | typeof NULL_STRING;
  label: string;
}

export interface ColumnDefinition {
  name: string;
}

export type TabularDataRow = Record<string, unknown>;

export type OSType = 'Windows' | 'MacOS' | 'UNIX' | 'Linux' | 'Unknown OS';

export function storeQuery(query: JsonObject): Promise<string> {
  return ZobiClient.post({
    endpoint: '/kv/store/',
    postPayload: { data: query },
  }).then(response => {
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?id=${response.json.id}`;
    return url;
  });
}

export function optionLabel(opt: OptionValue): string {
  if (opt === null) {
    return NULL_STRING;
  }
  if (opt === '') {
    return EMPTY_STRING;
  }
  if (opt === true) {
    return TRUE_STRING;
  }
  if (opt === false) {
    return FALSE_STRING;
  }
  if (typeof opt !== 'string' && typeof opt === 'number') {
    return opt.toString();
  }
  return opt as string;
}

export function optionValue(
  opt: OptionValue,
): OptionValue | typeof NULL_STRING {
  if (opt === null) {
    return NULL_STRING;
  }
  return opt;
}

export function optionFromValue(opt: OptionValue): OptionItem {
  // From a list of options, handles special values & labels
  return { value: optionValue(opt), label: optionLabel(opt) };
}

function getColumnName(column: string | ColumnDefinition): string {
  if (typeof column === 'string') {
    return column;
  }
  return column.name;
}

export function prepareCopyToClipboardTabularData(
  data: TabularDataRow[],
  columns: (string | ColumnDefinition)[],
): string {
  let result = columns.length
    ? `${columns.map(getColumnName).join('\t')}\n`
    : '';
  for (let i = 0; i < data.length; i += 1) {
    const row: Record<number, unknown> = {};
    for (let j = 0; j < columns.length; j += 1) {
      // JavaScript does not maintain the order of a mixed set of keys (i.e integers and strings)
      // the below function orders the keys based on the column names.
      const key = getColumnName(columns[j]);
      if (key in data[i]) {
        row[j] = data[i][key];
      } else {
        row[j] = data[i][parseFloat(key)];
      }
    }
    result += `${Object.values(row).join('\t')}\n`;
  }
  return result;
}

export function applyFormattingToTabularData(
  data: TabularDataRow[],
  timeFormattedColumns: string | string[],
): TabularDataRow[] {
  if (
    !data ||
    data.length === 0 ||
    ensureIsArray(timeFormattedColumns).length === 0
  ) {
    return data;
  }

  return data.map(row => ({
    ...row,
    /* eslint-disable no-underscore-dangle */
    ...ensureIsArray(timeFormattedColumns).reduce(
      (acc: Record<string, string>, colName: string) => {
        if (row[colName] !== null && row[colName] !== undefined) {
          acc[colName] = DATETIME_FORMATTER(row[colName] as Date | number);
        }
        return acc;
      },
      {},
    ),
  }));
}

export const noOp = (): undefined => undefined;

// Detects the user's OS through the browser
export const detectOS = (): OSType => {
  const { appVersion } = navigator;

  // Leveraging this condition because of stackOverflow
  // https://stackoverflow.com/questions/11219582/how-to-detect-my-browser-version-and-operating-system-using-javascript
  if (appVersion.includes('Win')) return 'Windows';
  if (appVersion.includes('Mac')) return 'MacOS';
  if (appVersion.includes('X11')) return 'UNIX';
  if (appVersion.includes('Linux')) return 'Linux';

  return 'Unknown OS';
};

export const isSafari = (): boolean => {
  const { userAgent } = navigator;

  return Boolean(userAgent && /^((?!chrome|android).)*safari/i.test(userAgent));
};
