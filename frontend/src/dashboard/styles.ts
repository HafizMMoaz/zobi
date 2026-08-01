import { css, ZobiTheme } from '@zobi.dev/extension-api/theme';

export const headerStyles = (theme: ZobiTheme) => css`
  body {
    h1 {
      font-weight: ${theme.fontWeightStrong};
      line-height: 1.4;
      font-size: ${theme.fontSizeXXL}px;
      letter-spacing: -0.2px;
      margin-top: ${theme.sizeUnit * 3}px;
      margin-bottom: ${theme.sizeUnit * 3}px;
    }

    h2 {
      font-weight: ${theme.fontWeightStrong};
      line-height: 1.4;
      font-size: ${theme.fontSizeXL}px;
      margin-top: ${theme.sizeUnit * 3}px;
      margin-bottom: ${theme.sizeUnit * 2}px;
    }

    h3,
    h4,
    h5,
    h6 {
      font-weight: ${theme.fontWeightStrong};
      line-height: 1.4;
      font-size: ${theme.fontSizeLG}px;
      letter-spacing: 0.2px;
      margin-top: ${theme.sizeUnit * 2}px;
      margin-bottom: ${theme.sizeUnit}px;
    }
  }
`;

// adds enough margin and padding so that the focus outline styles will fit
export const chartHeaderStyles = (theme: ZobiTheme) => css`
  .header-title a {
    margin: ${theme.sizeUnit / 2}px;
    padding: ${theme.sizeUnit / 2}px;
  }
  .header-controls {
    &,
    &:hover {
      margin-top: ${theme.sizeUnit}px;
    }
  }
`;

export const filterCardPopoverStyle = () => css`
  .filter-card-tooltip {
    &.ant-tooltip-placement-bottom {
      padding-top: 0;
      & .ant-tooltip-arrow {
        top: -13px;
      }
    }
  }
`;

export const chartContextMenuStyles = (theme: ZobiTheme) => css`
  .ant-dropdown-menu.chart-context-menu {
    min-width: ${theme.sizeUnit * 43}px;
  }
  .ant-dropdown-menu-submenu.chart-context-submenu {
    max-width: ${theme.sizeUnit * 60}px;
    min-width: ${theme.sizeUnit * 40}px;
  }
`;

export const focusStyle = (theme: ZobiTheme) => css`
  a,
  .ant-tabs-tabpane,
  .ant-tabs-tab-btn,
  .zobi-button,
  .zobi-button.ant-dropdown-trigger,
  .header-controls span {
    &:focus-visible {
      box-shadow: 0 0 0 2px ${theme.colorPrimaryText};
      border-radius: ${theme.borderRadius}px;
      outline: none;
      text-decoration: none;
    }
    &:not(
      .zobi-button,
      .ant-menu-item,
      a,
      .fave-unfave-icon,
      .ant-tabs-tabpane,
      .header-controls span
    ) {
      &:focus-visible {
        padding: ${theme.sizeUnit / 2}px;
      }
    }
  }
`;
