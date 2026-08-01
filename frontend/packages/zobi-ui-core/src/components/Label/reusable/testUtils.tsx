import { type ReactElement } from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { Theme, zobiTheme } from '@zobi/core-legacy/theme';

export function renderWithTheme(
  ui: ReactElement,
  tokenOverrides?: Record<string, string>,
) {
  const theme = tokenOverrides
    ? Theme.fromConfig({ token: tokenOverrides }).theme
    : zobiTheme;
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}
