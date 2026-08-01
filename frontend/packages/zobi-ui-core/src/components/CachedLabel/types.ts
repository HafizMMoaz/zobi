
import type { MouseEventHandler } from 'react';

export interface CacheLabelProps {
  onClick?: MouseEventHandler<HTMLElement>;
  cachedTimestamp?: string;
  className?: string;
}
