import type { ReactNode, SyntheticEvent } from 'react';

export type EmptyStateSize = 'small' | 'medium' | 'large';

export type EmptyStateProps = {
  title?: ReactNode;
  description?: ReactNode;
  image?: ReactNode | string;
  buttonText?: ReactNode;
  buttonIcon?: ReactNode;
  buttonAction?: (event: SyntheticEvent) => void;
  /** Controls image size. Defaults to 'medium'. */
  size?: EmptyStateSize;
  /** Controls title and description text size. Defaults to the value of `size` if not provided. */
  textSize?: EmptyStateSize;
  children?: ReactNode;
};
