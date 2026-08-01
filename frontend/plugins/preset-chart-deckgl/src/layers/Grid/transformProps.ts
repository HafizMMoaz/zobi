import { ChartProps } from '@zobi-ui/core';
import { transformSpatialProps } from '../spatialUtils';

export default function transformProps(chartProps: ChartProps) {
  return transformSpatialProps(chartProps);
}
