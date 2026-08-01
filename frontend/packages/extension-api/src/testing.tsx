import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom';
import { themeObject } from './theme';

// Define the wrapper component outside
const Providers = ({ children }: { children: React.ReactNode }) => (
  <themeObject.ZobiThemeProvider>
    {children}
  </themeObject.ZobiThemeProvider>
);

// Follow the exact pattern from RTL docs
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult => render(ui, { wrapper: Providers, ...options });

export {
  createEvent,
  fireEvent,
  screen,
  waitFor,
  cleanup,
  within,
  act,
} from '@testing-library/react';
export { customRender as render, userEvent };
