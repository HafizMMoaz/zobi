import { useState } from 'react';
import ControlPopover from '../ControlPopover/ControlPopover';
import { ColorBreakpointsPopoverTriggerProps } from './types';
import ColorBreakpointPopoverControl from './ColorBreakpointPopoverControl';

const ColorBreakpointsPopoverTrigger = ({
  value: initialValue,
  saveColorBreakpoint,
  isControlled,
  visible: controlledVisibility,
  toggleVisibility,
  colorBreakpoints,
  ...props
}: ColorBreakpointsPopoverTriggerProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const visible = isControlled ? controlledVisibility : isVisible;
  const setVisibility =
    isControlled && toggleVisibility ? toggleVisibility : setIsVisible;

  const popoverContent = (
    <ColorBreakpointPopoverControl
      value={initialValue}
      colorBreakpoints={colorBreakpoints}
      onSave={saveColorBreakpoint}
      onClose={() => setVisibility(false)}
    />
  );

  return (
    <ControlPopover
      trigger="click"
      content={popoverContent}
      defaultOpen={visible}
      open={visible}
      onOpenChange={setVisibility}
      destroyOnHidden
    >
      {props.children}
    </ControlPopover>
  );
};

export default ColorBreakpointsPopoverTrigger;
