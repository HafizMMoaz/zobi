import type { CSSProperties } from 'react';

export type PlaceholderProps = {
  showLoadingForImport?: boolean;
  width?: string | number;
  height?: string | number;
  placeholderStyle?: CSSProperties;
} & {
  [key: string]: any;
};
