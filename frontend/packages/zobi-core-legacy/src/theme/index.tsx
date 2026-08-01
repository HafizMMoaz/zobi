import emotionStyled, { CreateStyled } from '@emotion/styled';
import { useTheme as useThemeBasic } from '@emotion/react';
import { Theme } from './Theme';
import {
  type ZobiTheme,
  type SerializableThemeConfig,
  type AnyThemeConfig,
  type ThemeStorage,
  type ThemeControllerOptions,
  type ThemeContextType,
  type ZobiThemeConfig,
  ThemeAlgorithm,
  ThemeMode,
} from './types';

export {
  css,
  keyframes,
  jsx,
  ThemeProvider,
  CacheProvider as EmotionCacheProvider,
  withTheme,
} from '@emotion/react';
export { default as createEmotionCache } from '@emotion/cache';
export { default as exampleThemes } from './exampleThemes';

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ZobiTheme {}
}

export function useTheme() {
  const theme = useThemeBasic();
  // in the case there is no theme, useTheme returns an empty object
  if (Object.keys(theme).length === 0 && theme.constructor === Object) {
    throw new Error(
      'useTheme() could not find a ThemeContext. The <ThemeProvider/> component is likely missing from the app.',
    );
  }
  return theme;
}

const styled: CreateStyled = emotionStyled;

const themeObject: Theme = Theme.fromConfig();

const { theme } = themeObject;
const zobiTheme = theme;

export {
  Theme,
  ThemeAlgorithm,
  ThemeMode,
  themeObject,
  styled,
  theme,
  zobiTheme,
};

export type {
  ZobiTheme,
  SerializableThemeConfig,
  AnyThemeConfig,
  ThemeStorage,
  ThemeControllerOptions,
  ThemeContextType,
  ZobiThemeConfig,
};

// Export theme utility functions
export * from './utils/themeUtils';
export * from './utils';
