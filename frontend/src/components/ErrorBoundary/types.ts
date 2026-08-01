import type { ErrorInfo, ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  showMessage?: boolean;
  className?: string;
}

export interface ErrorBoundaryState {
  error: Error | null;
  info: ErrorInfo | null;
}
