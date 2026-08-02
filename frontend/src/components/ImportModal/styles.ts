import { css, ZobiTheme } from '@zobi.dev/extension-api/theme';

export const antdWarningAlertStyles = (theme: ZobiTheme) => css`
  margin: ${theme.sizeUnit * 4}px 0;

  .ant-alert-message {
    margin: 0;
  }
`;
