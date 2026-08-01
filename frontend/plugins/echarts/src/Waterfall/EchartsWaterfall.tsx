import Echart from '../components/Echart';
import { WaterfallChartTransformedProps } from './types';
import { EventHandlers } from '../types';

export default function EchartsWaterfall(
  props: WaterfallChartTransformedProps,
) {
  const { height, width, echartOptions, refs, onLegendStateChanged, formData } =
    props;

  const eventHandlers: EventHandlers = {
    legendselectchanged: payload => {
      onLegendStateChanged?.(payload.selected);
    },
    legendselectall: payload => {
      onLegendStateChanged?.(payload.selected);
    },
    legendinverseselect: payload => {
      onLegendStateChanged?.(payload.selected);
    },
  };

  return (
    <Echart
      refs={refs}
      height={height}
      width={width}
      echartOptions={echartOptions}
      eventHandlers={eventHandlers}
      vizType={formData.vizType}
    />
  );
}
