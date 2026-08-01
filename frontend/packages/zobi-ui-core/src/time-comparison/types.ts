

/**
 * Supported comparison time ranges
 */

export enum ComparisonTimeRangeType {
  Custom = 'c',
  InheritedRange = 'r',
  Month = 'm',
  Week = 'w',
  Year = 'y',
}

export type DateTimeGrainType =
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';

export type CustomRangeKey =
  | 'sinceMode'
  | 'sinceDatetime'
  | 'sinceGrain'
  | 'sinceGrainValue'
  | 'untilMode'
  | 'untilDatetime'
  | 'untilGrain'
  | 'untilGrainValue'
  | 'anchorMode'
  | 'anchorValue';

export type DateTimeModeType = 'specific' | 'relative' | 'now' | 'today';

export type CustomRangeType = {
  sinceMode: DateTimeModeType;
  sinceDatetime: string;
  sinceGrain: DateTimeGrainType;
  sinceGrainValue: number;
  untilMode: DateTimeModeType;
  untilDatetime: string;
  untilGrain: DateTimeGrainType;
  untilGrainValue: number;
  anchorMode: 'now' | 'specific';
  anchorValue: string;
};

export type CustomRangeDecodeType = {
  customRange: CustomRangeType;
  matchedFlag: boolean;
};
