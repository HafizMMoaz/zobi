import { HeatmapTransformedProps } from './types';
import Echart from '../components/Echart';

export default function Heatmap(props: HeatmapTransformedProps) {
  const { height, width, echartOptions, refs } = props;
  return (
    <Echart
      refs={refs}
      height={height}
      width={width}
      echartOptions={echartOptions}
    />
  );
}
