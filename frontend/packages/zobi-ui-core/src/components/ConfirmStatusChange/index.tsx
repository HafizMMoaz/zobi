import { useState } from 'react';

import { DeleteModal } from '../DeleteModal';
import type { ConfirmStatusChangeProps } from './types';

export function ConfirmStatusChange({
  title,
  description,
  onConfirm,
  children,
}: ConfirmStatusChangeProps) {
  const [open, setOpen] = useState(false);
  const [currentCallbackArgs, setCurrentCallbackArgs] = useState<any[]>([]);

  const showConfirm = (...callbackArgs: any[]) => {
    // check if any args are DOM events, if so, handle them
    callbackArgs.forEach(arg => {
      if (!arg) {
        return;
      }
      if (typeof arg.preventDefault === 'function') {
        arg.preventDefault();
      }
      if (typeof arg.stopPropagation === 'function') {
        arg.stopPropagation();
      }
    });
    setOpen(true);
    setCurrentCallbackArgs(callbackArgs);
  };

  const hide = () => {
    setOpen(false);
    setCurrentCallbackArgs([]);
  };

  const confirm = () => {
    onConfirm(...currentCallbackArgs);
    hide();
  };

  return (
    <>
      {children?.(showConfirm)}
      <DeleteModal
        description={description}
        onConfirm={confirm}
        onHide={hide}
        open={open}
        name="please confirm"
        title={title}
      />
    </>
  );
}

export type { ConfirmStatusChangeProps };
