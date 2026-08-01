/* eslint-disable camelcase */
export enum RollingType {
  Mean = 'mean',
  Sum = 'sum',
  Std = 'std',
  Cumsum = 'cumsum',
}
export interface RollingWindow {
  rolling_type?: RollingType;
  rolling_periods?: number;
  min_periods?: number;
}

export enum ComparisonType {
  Values = 'values',
  Difference = 'difference',
  Percentage = 'percentage',
  Ratio = 'ratio',
}
export interface TimeCompare {
  time_compare?: string;
  comparison_type?: ComparisonType;
}

export default {};
