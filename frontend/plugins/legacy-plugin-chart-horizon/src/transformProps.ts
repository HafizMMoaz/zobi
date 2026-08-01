import { ChartProps } from '@zobi-ui/core';

export default function transformProps(chartProps: ChartProps) {
  const { height, width, formData, queriesData } = chartProps;
  const {
    horizon_color_scale: horizonColorScale,
    series_height: seriesHeight,
  } = formData;

  // Only include colorScale if defined, otherwise let defaultProps apply
  return {
    ...(horizonColorScale !== undefined && {
      colorScale: horizonColorScale as string,
    }),
    data: queriesData[0].data,
    height,
    seriesHeight: parseInt(String(seriesHeight ?? 20), 10),
    width,
  };
}
