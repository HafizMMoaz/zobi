
import { ZobiTheme } from '@zobi.dev/extension-api/theme';

export const getAccessibleColorBounds = (theme: ZobiTheme): string[] => [
  theme.colorError, // Red variant for negative/danger
  theme.colorPrimary, // Blue variant for positive/primary
];

// Default fallback for backward compatibility
export const ACCESSIBLE_COLOR_BOUNDS = [
  // eslint-disable-next-line theme-colors/no-literal-colors
  '#ca0020',
  // eslint-disable-next-line theme-colors/no-literal-colors
  '#0571b0',
];
