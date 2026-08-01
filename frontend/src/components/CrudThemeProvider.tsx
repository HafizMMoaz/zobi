import { ReactNode, useEffect, useMemo } from 'react';
import { logging } from '@zobi/core/utils';
import {
  Theme,
  normalizeThemeConfig,
  isThemeConfigDark,
} from '@zobi/core/theme';
import getBootstrapData from 'src/utils/getBootstrapData';
import type { Dashboard } from 'src/types/Dashboard';

interface CrudThemeProviderProps {
  children: ReactNode;
  theme?: Dashboard['theme'];
}

/**
 * CrudThemeProvider applies a dashboard-specific theme using theme data
 * from the dashboard API response. Merges with the system's base theme
 * (light or dark) and loads custom fonts. Falls back to the global theme
 * if the theme data is missing or invalid.
 */
export default function CrudThemeProvider({
  children,
  theme,
}: CrudThemeProviderProps) {
  const { dashboardTheme, fontUrls } = useMemo(() => {
    if (!theme?.json_data) {
      return { dashboardTheme: null, fontUrls: undefined };
    }
    try {
      const themeConfig = JSON.parse(theme.json_data);
      const normalizedConfig = normalizeThemeConfig(themeConfig);
      const isDark = isThemeConfigDark(normalizedConfig);
      const {
        common: { theme: bootstrapTheme },
      } = getBootstrapData();
      const baseTheme = isDark ? bootstrapTheme.dark : bootstrapTheme.default;
      const createdTheme = Theme.fromConfig(
        normalizedConfig,
        baseTheme || undefined,
      );
      const rawUrls = themeConfig?.token?.fontUrls;
      const urls = Array.isArray(rawUrls) ? (rawUrls as string[]) : undefined;
      return { dashboardTheme: createdTheme, fontUrls: urls };
    } catch (error) {
      logging.warn('Failed to load dashboard theme:', error);
      return { dashboardTheme: null, fontUrls: undefined };
    }
  }, [theme?.json_data]);

  useEffect(() => {
    if (!dashboardTheme || !fontUrls?.length) return undefined;

    // JSON.stringify provides safe escaping to prevent CSS injection
    const css = fontUrls
      .map((url: string) => `@import url(${JSON.stringify(url)});`)
      .join('\n');
    const style = document.createElement('style');
    style.setAttribute('data-zobi-fonts', 'true');
    style.textContent = css;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, [dashboardTheme, fontUrls]);

  if (!dashboardTheme) {
    return <>{children}</>;
  }

  return (
    <dashboardTheme.ZobiThemeProvider>
      {children}
    </dashboardTheme.ZobiThemeProvider>
  );
}
