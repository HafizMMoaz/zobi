import { TreeTransformedProps } from './types';
import Echart from '../components/Echart';

export default function EchartsTree({
  echartOptions,
  height,
  refs,
  width,
  formData,
}: TreeTransformedProps) {
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
