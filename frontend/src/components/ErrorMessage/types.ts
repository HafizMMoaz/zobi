import type { ReactNode, ComponentType } from 'react';
import type { ErrorSource, ZobiError } from '@zobi.dev/core';

export type ErrorMessageComponentProps<ExtraType = Record<string, any> | null> =
  {
    error: ZobiError<ExtraType>;
    source?: ErrorSource;
    subtitle?: ReactNode;
    compact?: boolean;
    closable?: boolean;
  };

export type ErrorMessageComponent = ComponentType<ErrorMessageComponentProps>;

export interface ErrorAlertProps {
  errorType?: string; // Strong text on the first line
  message: React.ReactNode | string; // Text shown on the first line
  type?: 'warning' | 'error' | 'info'; // Allows only 'warning' or 'error'
  description?: React.ReactNode; // Text shown under the first line, not collapsible
  descriptionDetails?: React.ReactNode | string; // Text shown under the first line, collapsible
  descriptionDetailsCollapsed?: boolean; // Hides the collapsible section unless "Show more" is clicked, default true
  messagePre?: boolean; // Uses pre-style on the message, default false
  descriptionPre?: boolean; // Uses pre-style to break lines, default true
  compact?: boolean; // Shows the error icon with tooltip and modal, default false
  children?: React.ReactNode; // Additional content to show in the modal
  closable?: boolean; // Show close button, default true
  showIcon?: boolean; // Show icon, default true
  className?: string;
}
