import { ChartProps } from '@zobi.dev/core';
import { transformSpatialProps } from '../spatialUtils';

export default function transformProps(chartProps: ChartProps) {
  return transformSpatialProps(chartProps);
}
