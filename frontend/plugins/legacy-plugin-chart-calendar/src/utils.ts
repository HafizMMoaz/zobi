
import { getTimeFormatter } from '@zobi-ui/core';

// Cal-Heatmap provides local timestamps. We subtract the offset so that utcFormat displays the correct local date.
export const getFormattedUTCTime = (
  ts: number | string,
  timeFormat?: string,
) => {
  const date = new Date(ts);
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return getTimeFormatter(timeFormat)(date.getTime() - offset);
};

// The vendor library interprets timestamps as local time but the backend sends UTC timestamps.
// That's why we need to add the offset
export const convertUTCTimestampToLocal = (utcTimestamp: number): number => {
  const date = new Date(utcTimestamp);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return utcTimestamp + offsetMs;
};
