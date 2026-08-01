import { Input } from '@zobi-ui/core/components';

interface HiddenControlsProps {
  onChange: () => void;
  value: string | number | readonly string[] | undefined;
}

export default function HiddenControl(props: HiddenControlsProps) {
  // This wouldn't be necessary but might as well
  return <Input type="hidden" value={props.value} />;
}
