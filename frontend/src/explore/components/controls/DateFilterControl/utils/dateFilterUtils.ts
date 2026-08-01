import {
  NO_TIME_RANGE,
  JsonObject,
  customTimeRangeDecode,
} from '@zobi.dev/core';
import { useSelector } from 'react-redux';
import {
  COMMON_RANGE_VALUES_SET,
  CALENDAR_RANGE_VALUES_SET,
  CURRENT_RANGE_VALUES_SET,
} from '.';
import { FrameType } from '../types';

export const guessFrame = (timeRange: string): FrameType => {
  if (COMMON_RANGE_VALUES_SET.has(timeRange)) {
    return 'Common';
  }
  if (CALENDAR_RANGE_VALUES_SET.has(timeRange)) {
    return 'Calendar';
  }
  if (CURRENT_RANGE_VALUES_SET.has(timeRange)) {
    return 'Current';
  }
  if (timeRange === NO_TIME_RANGE) {
    return 'No filter';
  }
  if (customTimeRangeDecode(timeRange).matchedFlag) {
    return 'Custom';
  }
  return 'Advanced';
};

export function useDefaultTimeFilter() {
  return (
    useSelector(
      (state: JsonObject) => state?.common?.conf?.DEFAULT_TIME_FILTER,
    ) ?? NO_TIME_RANGE
  );
}
