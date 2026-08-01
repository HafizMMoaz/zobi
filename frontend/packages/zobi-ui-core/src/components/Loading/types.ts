export type PositionOption =
  | 'floating'
  | 'inline'
  | 'inline-centered'
  | 'normal';

export type SizeOption = 's' | 'm' | 'l';

export interface LoadingProps {
  position?: PositionOption;
  className?: string;
  image?: string;
  size?: SizeOption;
  muted?: boolean;
}
