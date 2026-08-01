import type { IconType } from '@zobi-ui/core/components/Icons/types';

export interface CertifiedBadgeProps {
  certifiedBy?: string;
  details?: string;
  size?: IconType['iconSize'];
}
