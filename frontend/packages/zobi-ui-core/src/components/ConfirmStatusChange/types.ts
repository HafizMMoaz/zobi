import type { ReactNode } from 'react';

export type Callback = (...args: any[]) => void;

export interface ConfirmStatusChangeProps {
  title: ReactNode;
  description: ReactNode;
  onConfirm: Callback;
  children: (showConfirm: Callback) => ReactNode;
}
