
// @fontsource/* v5.1+ doesn't play nice with eslint-import plugin v2.31+
/* eslint-disable import/extensions */
import '@fontsource/inter/200.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
/* eslint-enable import/extensions */

import { css, useTheme, Global } from '@emotion/react';
import { useThemeMode } from './utils/themeUtils';

export const GlobalStyles = () => {
  const theme = useTheme();
  const isDark = useThemeMode();
  return (
    <Global
      key={`global-${theme.colorLink}`}
      styles={css`
        // SPA
        html {
          color-scheme: ${isDark ? 'dark' : 'light'};
        }

        html,
        body,
        #app {
          height: 100%;
        }

        body {
          background-color: ${theme.colorBgBase};
          color: ${theme.colorText};
          -webkit-font-smoothing: antialiased;
          margin: 0;
          font-family: ${theme.fontFamily};
        }

        a {
          color: ${theme.colorLink};
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        strong,
        th {
          font-weight: ${theme.fontWeightStrong};
        }

        .echarts-tooltip[style*='visibility: hidden'] {
          display: none !important;
        }

        .no-wrap {
          white-space: nowrap;
        }

        .column-config-popover {
          & .ant-input-number {
            width: 100%;
          }
          && .btn-group svg {
            line-height: 0;
            top: 0;
          }
          & .btn-group > .btn {
            padding: 5px 10px 6px;
          }
        }

        // Overriding bootstrap styles
        #app {
          flex: 1 1 auto;
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        [role='button'] {
          cursor: pointer;
        }

        // Override geostyler CSS that hides AntD ColorPicker alpha input
        // See: https://github.com/HafizMMoaz/zobi/issues/34721
        .ant-color-picker .ant-color-picker-alpha-input {
          display: block;
        }

        .ant-color-picker .ant-color-picker-slider-alpha {
          display: flex;
          margin-top: ${theme.marginXS}px;
        }
      `}
    />
  );
};
