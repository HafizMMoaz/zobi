import { FunnelChartTransformedProps } from './types';
import Echart from '../components/Echart';
import { allEventHandlers } from '../utils/eventHandlers';

export default function EchartsFunnel(props: FunnelChartTransformedProps) {
  const { height, width, echartOptions, selectedValues, refs, formData } =
    props;

  const eventHandlers = allEventHandlers(props);

  return (
    <Echart
      refs={refs}
      height={height}
      width={width}
      echartOptions={echartOptions}
      eventHandlers={eventHandlers}
      selectedValues={selectedValues}
      vizType={formData.vizType}
    />
  );
}
