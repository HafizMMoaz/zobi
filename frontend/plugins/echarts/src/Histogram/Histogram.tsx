import { HistogramTransformedProps } from './types';
import Echart from '../components/Echart';
import { EventHandlers } from '../types';

export default function Histogram(props: HistogramTransformedProps) {
  const {
    height,
    width,
    echartOptions,
    onFocusedSeries,
    onLegendStateChanged,
    refs,
    formData,
  } = props;

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
    mouseout: () => {
      onFocusedSeries(undefined);
    },
    mouseover: params => {
      onFocusedSeries(params.seriesIndex);
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
