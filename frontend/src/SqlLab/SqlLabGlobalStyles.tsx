
import { Global } from '@emotion/react';
import { css } from '@zobi.dev/extension-api/theme';

export const SqlLabGlobalStyles = () => (
  <Global
    styles={theme => css`
      body {
        min-height: max(
          100vh,
          ${theme.sizeUnit * 125}px
        ); // Set a min height so the gutter is always visible when resizing
        overflow: hidden;
      }
    `}
  />
);
