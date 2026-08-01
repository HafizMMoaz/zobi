/* eslint-disable camelcase */

import { JsonObject } from '@zobi-ui/core';

export const getTimeOffset = (
  series: JsonObject,
  timeCompare: string[],
): string | undefined =>
  timeCompare.find(
    timeOffset =>
      // offset is represented as <offset>, group by list
      series.name.includes(`${timeOffset},`) ||
      // offset is represented as <metric>__<offset>
      series.name.includes(`__${timeOffset}`) ||
      // offset is represented as <metric>, <offset>
      series.name.includes(`, ${timeOffset}`),
  );

export const hasTimeOffset = (
  series: JsonObject,
  timeCompare: string[],
): boolean =>
  typeof series.name === 'string'
    ? !!getTimeOffset(series, timeCompare)
    : false;

export const getOriginalSeries = (
  seriesName: string,
  timeCompare: string[],
): string => {
  let result = seriesName;
  timeCompare.forEach(compare => {
    // offset in the middle: <metric>, <offset>, <dimension>
    result = result.replace(`, ${compare},`, ',');
    // offset at start: <offset>, <dimension>
    result = result.replace(`${compare},`, '');
    // offset with double underscore: <metric>__<offset>
    result = result.replace(`__${compare}`, '');
    // offset at end: <metric>, <offset>
    result = result.replace(`, ${compare}`, '');
  });
  return result.trim();
};
