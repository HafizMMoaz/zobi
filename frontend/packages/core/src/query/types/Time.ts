import { QueryObject } from './Query';

export type TimeRange = {
  /** Time range of the query [from, to] */
  time_range?: string;
  since?: string;
  until?: string;
};

export type TimeColumnConfigKey =
  | '__time_col'
  | '__time_grain'
  | '__time_range'
  | '__granularity'
  | '__time_compare';

export type AppliedTimeExtras = Partial<
  Record<TimeColumnConfigKey, keyof QueryObject>
>;

export default {};
