import type { Preview } from '@storybook/react';
import { ThemeProvider, zobiTheme } from '@zobi.dev/extension-api/theme';

/**
 * Every emotion-styled component in the repo reads from theme context, and
 * `useTheme()` throws rather than falling back when no provider is present.
 * Wrapping globally here means individual stories never have to.
 */
const preview: Preview = {
  decorators: [
    Story => (
      <ThemeProvider theme={zobiTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: { method: 'alphabetical' },
    },
  },
};

export default preview;
