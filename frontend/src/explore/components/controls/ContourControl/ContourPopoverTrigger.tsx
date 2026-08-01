import { useState } from 'react';
import ContourPopoverControl from './ContourPopoverControl';
import ControlPopover from '../ControlPopover/ControlPopover';
import { ContourPopoverTriggerProps } from './types';

const ContourPopoverTrigger = ({
  value: initialValue,
  saveContour,
  isControlled,
  visible: controlledVisibility,
  toggleVisibility,
  ...props
}: ContourPopoverTriggerProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const visible = isControlled ? controlledVisibility : isVisible;
  const setVisibility =
    isControlled && toggleVisibility ? toggleVisibility : setIsVisible;

  const popoverContent = (
    <ContourPopoverControl
      value={initialValue}
      onSave={saveContour}
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

export default ContourPopoverTrigger;
