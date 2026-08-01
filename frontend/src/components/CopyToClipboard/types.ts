import type { ReactNode } from 'react';

export interface CopyToClipboardProps {
  copyNode?: ReactNode;
  disabled?: boolean;
  getText?: (callback: (data: string) => void) => void;
  onCopyEnd?: () => void;
  shouldShowText?: boolean;
  text?: string;
  wrapped?: boolean;
  tooltipText?: string;
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  hideTooltip?: boolean;
}
