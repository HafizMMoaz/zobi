import { ChartProps, TimeseriesDataRecord } from '@zobi-ui/core';

export default function transformProps(chartProps: ChartProps) {
  const { width, height, formData, queriesData } = chartProps;
  const data = queriesData[0].data as TimeseriesDataRecord[];

  return {
    width,
    height,
    data,
    formData,
  };
}
