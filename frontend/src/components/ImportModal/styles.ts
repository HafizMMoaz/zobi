
import { css, ZobiTheme } from '@zobi/core/theme';

export const antdWarningAlertStyles = (theme: ZobiTheme) => css`
  margin: ${theme.sizeUnit * 4}px 0;

  .ant-alert-message {
    margin: 0;
  }
`;
