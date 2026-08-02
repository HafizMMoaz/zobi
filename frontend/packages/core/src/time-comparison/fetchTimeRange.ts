import rison from 'rison';
import { isEmpty } from 'lodash';
import {
  ZobiClient,
  getClientErrorObject,
  ensureIsArray,
} from '@zobi.dev/core';

export const SEPARATOR = ' : ';

export const buildTimeRangeString = (since: string, until: string): string =>
  `${since}${SEPARATOR}${until}`;

const formatDateEndpoint = (dttm: string, isStart?: boolean): string =>
  dttm.replace('T00:00:00', '') || (isStart ? '-∞' : '∞');

export const formatTimeRange = (
  timeRange: string,
  columnPlaceholder = 'col',
) => {
  const splitDateRange = timeRange.split(SEPARATOR);
  if (splitDateRange.length === 1) return timeRange;
  return `${formatDateEndpoint(
    splitDateRange[0],
    true,
  )} ≤ ${columnPlaceholder} < ${formatDateEndpoint(splitDateRange[1])}`;
};

export const formatTimeRangeComparison = (
  initialTimeRange: string,
  shiftedTimeRange: string,
  columnPlaceholder = 'col',
) => {
  const splitInitialDateRange = initialTimeRange.split(SEPARATOR);
  const splitShiftedDateRange = shiftedTimeRange.split(SEPARATOR);
  return `${columnPlaceholder}: ${formatDateEndpoint(
    splitInitialDateRange[0],
    true,
  )} to ${formatDateEndpoint(splitInitialDateRange[1])} vs
  ${formatDateEndpoint(splitShiftedDateRange[0], true)} to ${formatDateEndpoint(
    splitShiftedDateRange[1],
  )}`;
};

export const fetchTimeRange = async (
  timeRange: string,
  columnPlaceholder = 'col',
  shifts?: string[],
) => {
  let query;
  let endpoint;
  if (!isEmpty(shifts)) {
    const timeRanges = ensureIsArray(shifts).map(shift => ({
      timeRange,
      shift,
    }));
    query = rison.encode_uri([{ timeRange }, ...timeRanges]);
    endpoint = `/api/v1/time_range/?q=${query}`;
  } else {
    query = rison.encode_uri(timeRange);
    endpoint = `/api/v1/time_range/?q=${query}`;
  }
  try {
    const response = await ZobiClient.get({ endpoint });
    if (isEmpty(shifts)) {
      const timeRangeString = buildTimeRangeString(
        response?.json?.result[0]?.since || '',
        response?.json?.result[0]?.until || '',
      );
      return {
        value: formatTimeRange(timeRangeString, columnPlaceholder),
      };
    }
    const timeRanges = response?.json?.result.map((result: any) =>
      buildTimeRangeString(result.since, result.until),
    );
    return {
      value: timeRanges
        .slice(1)
        .map((timeRange: string) =>
          formatTimeRangeComparison(
            timeRanges[0],
            timeRange,
            columnPlaceholder,
          ),
        ),
    };
  } catch (caught) {
    // `catch` binds as `unknown`; this rejects with a fetch `Response`.
    const response = caught as Response;
    const clientError = await getClientErrorObject(response);
    return {
      error: clientError.message || clientError.error || response.statusText,
    };
  }
};
