import { SliderSingleProps, SliderRangeProps } from 'antd/es/slider';
import { Slider as AntdSlider } from 'antd';

export type { SliderSingleProps, SliderRangeProps };

export default function Slider(props: SliderSingleProps | SliderRangeProps) {
  return <AntdSlider {...props} />;
}
