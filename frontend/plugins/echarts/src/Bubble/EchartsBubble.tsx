import { BubbleChartTransformedProps } from './types';
import Echart from '../components/Echart';

export default function EchartsBubble(props: BubbleChartTransformedProps) {
  const { height, width, echartOptions, refs, formData } = props;
  return (
    <Echart
      height={height}
      width={width}
      echartOptions={echartOptions}
      refs={refs}
      vizType={formData.vizType}
    />
  );
}
