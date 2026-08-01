
import type { ReactNode } from 'react';

export interface DeleteModalProps {
  description: ReactNode;
  onConfirm: () => void;
  onHide: () => void;
  open: boolean;
  title: ReactNode;
  name?: string;
}
