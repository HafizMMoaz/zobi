import { SankeyTransformedProps } from './types';
import Echart from '../components/Echart';

export default function Sankey(props: SankeyTransformedProps) {
  const { height, width, echartOptions, refs, formData } = props;

  return (
    <Echart
      refs={refs}
      height={height}
      width={width}
      echartOptions={echartOptions}
      vizType={formData.vizType}
    />
  );
}
