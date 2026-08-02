import { utcFormat, timeFormat } from 'd3-time-format';
import { utcUtils, localTimeUtils } from '../utils/d3Time';
import TimeFormatter from '../TimeFormatter';

/*
 * A formatter that examines all the values, and uses the finest temporal grain.
 */
export default function finestTemporalGrain(
  values: any[],
  useLocalTime = false,
) {
  const format = useLocalTime ? timeFormat : utcFormat;

  const formatMillisecond = format('%Y-%m-%d %H:%M:%S.%L');
  const formatSecond = format('%Y-%m-%d %H:%M:%S');
  const formatMinute = format('%Y-%m-%d %H:%M');
  const formatHour = format('%Y-%m-%d %H:%M');
  const formatDay = format('%Y-%m-%d');
  const formatMonth = format('%Y-%m-%d');
  const formatYear = format('%Y');

  const {
    hasMillisecond,
    hasSecond,
    hasMinute,
    hasHour,
    isNotFirstDayOfMonth,
    isNotFirstMonth,
  } = useLocalTime ? localTimeUtils : utcUtils;

  let formatFunc = formatYear;

  values.forEach((value: any) => {
    if (typeof value === 'bigint') {
      return;
    }
    if (formatFunc === formatYear && isNotFirstMonth(value)) {
      formatFunc = formatMonth;
    }
    if (formatFunc === formatMonth && isNotFirstDayOfMonth(value)) {
      formatFunc = formatDay;
    }
    if (formatFunc === formatDay && hasHour(value)) {
      formatFunc = formatHour;
    }
    if (formatFunc === formatHour && hasMinute(value)) {
      formatFunc = formatMinute;
    }
    if (formatFunc === formatMinute && hasSecond(value)) {
      formatFunc = formatSecond;
    }
    if (formatFunc === formatSecond && hasMillisecond(value)) {
      formatFunc = formatMillisecond;
    }
  });

  return new TimeFormatter({
    description:
      'Use the finest grain in an array of dates to format all dates in the array',
    formatFunc,
    id: 'finest_temporal_grain',
    label: 'Format temporal columns with the finest grain',
    useLocalTime,
  });
}
