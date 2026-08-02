import tinycolor from 'tinycolor2';
import { useTheme as useEmotionTheme } from '@emotion/react';
import { theme as antdTheme } from 'antd';
import type {
  ZobiTheme,
  FontSizeKey,
  ColorVariants,
  AnyThemeConfig,
} from '../types';
import { normalizeThemeConfig } from '.';

const fontSizeMap: Record<FontSizeKey, keyof ZobiTheme> = {
  xs: 'fontSizeXS',
  s: 'fontSizeSM',
  m: 'fontSize',
  l: 'fontSizeLG',
  xl: 'fontSizeXL',
  xxl: 'fontSizeXXL',
};

/**
 * Get font size from theme tokens based on size key
 * @param theme - Theme tokens from useTheme()
 * @param size - Font size key
 * @returns Font size as string
 */
export function getFontSize(theme: ZobiTheme, size?: FontSizeKey): string {
  const key = fontSizeMap[size || 'm'];
  return String(theme[key] || theme.fontSize);
}

/**
 * Check if the current theme is dark mode based on background color
 * @param theme - Theme tokens from useTheme()
 * @returns true if theme is dark, false if light
 */
export function isThemeDark(theme: ZobiTheme): boolean {
  return tinycolor(theme.colorBgContainer).isDark();
}

/**
 * Get color variants for a given color type from theme tokens
 * @param theme - Theme tokens from useTheme()
 * @param color - Color type (e.g., 'primary', 'error', 'success')
 * @returns ColorVariants object with bg, border, text colors etc.
 */
export function getColorVariants(
  theme: ZobiTheme,
  color: string,
): ColorVariants {
  const firstLetterCapped = color.charAt(0).toUpperCase() + color.slice(1);

  if (color === 'default' || color === 'grayscale') {
    const isDark = isThemeDark(theme);

    const flipBrightness = (baseColor: string): string => {
      if (!isDark) return baseColor;
      const { r, g, b } = tinycolor(baseColor).toRgb();
      const invertedColor = tinycolor({ r: 255 - r, g: 255 - g, b: 255 - b });
      return invertedColor.toHexString();
    };

    return {
      active: flipBrightness('#222'),
      textActive: flipBrightness('#444'),
      text: flipBrightness('#555'),
      textHover: flipBrightness('#666'),
      hover: flipBrightness('#888'),
      borderHover: flipBrightness('#AAA'),
      border: flipBrightness('#CCC'),
      bgHover: flipBrightness('#DDD'),
      bg: flipBrightness('#F4F4F4'),
    };
  }

  return {
    active: theme[
      `color${firstLetterCapped}Active` as keyof ZobiTheme
    ] as string,
    textActive: theme[
      `color${firstLetterCapped}TextActive` as keyof ZobiTheme
    ] as string,
    text: theme[`color${firstLetterCapped}Text` as keyof ZobiTheme] as string,
    textHover: theme[
      `color${firstLetterCapped}TextHover` as keyof ZobiTheme
    ] as string,
    hover: theme[`color${firstLetterCapped}Hover` as keyof ZobiTheme] as string,
    borderHover: theme[
      `color${firstLetterCapped}BorderHover` as keyof ZobiTheme
    ] as string,
    border: theme[
      `color${firstLetterCapped}Border` as keyof ZobiTheme
    ] as string,
    bgHover: theme[
      `color${firstLetterCapped}BgHover` as keyof ZobiTheme
    ] as string,
    bg: theme[`color${firstLetterCapped}Bg` as keyof ZobiTheme] as string,
  };
}

/**
 * Check if a theme configuration results in a dark theme
 * @param config - The theme configuration to check
 * @returns true if the config results in a dark theme, false otherwise
 */
export function isThemeConfigDark(config: AnyThemeConfig): boolean {
  try {
    const normalizedConfig = normalizeThemeConfig(config);
    const themeConfig = antdTheme.getDesignToken(normalizedConfig);

    return tinycolor(themeConfig.colorBgContainer).isDark();
  } catch {
    return false;
  }
}

/**
 * Hook to determine if the current theme is dark mode
 * @returns true if theme is dark, false if light
 */
export function useThemeMode(): boolean {
  const theme = useEmotionTheme() as ZobiTheme;
  return isThemeDark(theme);
}
