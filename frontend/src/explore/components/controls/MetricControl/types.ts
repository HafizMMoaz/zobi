export type savedMetricType = {
  metric_name: string;
  verbose_name?: string;
  expression: string;
  error_text?: string;
  id?: number | string;
};

export interface AggregateOption {
  aggregate_name: string;
}
