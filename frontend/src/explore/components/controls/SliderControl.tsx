import Slider from '@zobi-ui/core/components/Slider';
import ControlHeader, {
  ControlHeaderProps,
} from 'src/explore/components/ControlHeader';

type SliderControlProps = ControlHeaderProps & {
  onChange: (value: number) => void;
  value: number;
  default?: number;
};

export default function SliderControl({
  default: defaultValue,
  name,
  label,
  description,
  renderTrigger,
  rightNode,
  leftNode,
  validationErrors,
  hovered,
  warning,
  danger,
  onClick,
  tooltipOnClick,
  onChange = () => {},
  ...rest
}: SliderControlProps) {
  const headerProps = {
    name,
    label,
    description,
    renderTrigger,
    rightNode,
    leftNode,
    validationErrors,
    onClick,
    hovered,
    tooltipOnClick,
    warning,
    danger,
  };
  return (
    <>
      <ControlHeader {...headerProps} />
      <Slider {...rest} onChange={onChange} defaultValue={defaultValue} />
    </>
  );
}
