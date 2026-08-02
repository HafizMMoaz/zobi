import {
  timeFormatLocale,
  TimeLocaleDefinition,
  timeFormat,
  utcFormat,
} from 'd3-time-format';
import { utcUtils, localTimeUtils } from '../utils/d3Time';
import TimeFormatter from '../TimeFormatter';

type FormatsByStep = Partial<{
  millisecond: string;
  second: string;
  minute: string;
  hour: string;
  day: string;
  week: string;
  month: string;
  year: string;
}>;

export default function createMultiFormatter({
  id,
  label,
  description,
  formats = {},
  useLocalTime = false,
  locale,
}: {
  id: string;
  label?: string;
  description?: string;
  formats?: FormatsByStep;
  useLocalTime?: boolean;
  locale?: TimeLocaleDefinition;
}) {
  const {
    millisecond = '.%L',
    second = ':%S',
    minute = '%I:%M',
    hour = '%I %p',
    day = '%a %d',
    week = '%b %d',
    month = '%B',
    year = '%Y',
  } = formats;

  let formatFunc;

  if (typeof locale === 'undefined') {
    formatFunc = useLocalTime ? timeFormat : utcFormat;
  } else {
    const formatLocale = timeFormatLocale(locale);
    formatFunc = useLocalTime ? formatLocale.format : formatLocale.utcFormat;
  }

  const formatMillisecond = formatFunc(millisecond);
  const formatSecond = formatFunc(second);
  const formatMinute = formatFunc(minute);
  const formatHour = formatFunc(hour);
  const formatDay = formatFunc(day);
  const formatFirstDayOfWeek = formatFunc(week);
  const formatMonth = formatFunc(month);
  const formatYear = formatFunc(year);

  const {
    hasMillisecond,
    hasSecond,
    hasMinute,
    hasHour,
    isNotFirstDayOfMonth,
    isNotFirstDayOfWeek,
    isNotFirstMonth,
  } = useLocalTime ? localTimeUtils : utcUtils;

  function multiFormatFunc(date: Date) {
    if (hasMillisecond(date)) {
      return formatMillisecond;
    }
    if (hasSecond(date)) {
      return formatSecond;
    }
    if (hasMinute(date)) {
      return formatMinute;
    }
    if (hasHour(date)) {
      return formatHour;
    }
    if (isNotFirstDayOfMonth(date)) {
      return isNotFirstDayOfWeek(date) ? formatDay : formatFirstDayOfWeek;
    }
    if (isNotFirstMonth(date)) {
      return formatMonth;
    }

    return formatYear;
  }

  return new TimeFormatter({
    description,
    formatFunc: (date: Date) => multiFormatFunc(date)(date),
    id,
    label,
    useLocalTime,
  });
}
