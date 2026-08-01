import type { ReactNode, ComponentType, ReactElement } from 'react';
import type { BackgroundPosition } from './ImageLoader';

export interface LinkProps {
  to: string;
  children?: ReactNode;
}

export interface ListViewCardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  url?: string;
  linkComponent?: ComponentType<LinkProps>;
  imgURL?: string | null;
  imgFallbackURL?: string;
  imgPosition?: BackgroundPosition;
  description: string;
  loading?: boolean;
  titleRight?: ReactNode;
  coverLeft?: ReactNode;
  coverRight?: ReactNode;
  actions?: ReactNode | null;
  rows?: number | string;
  avatar?: ReactElement | null;
  cover?: ReactNode | null;
  certifiedBy?: string;
  certificationDetails?: string;
}
