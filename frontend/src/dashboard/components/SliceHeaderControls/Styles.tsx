import { css, ZobiTheme } from '@zobi/core/theme';

export const fullscreenStyles = (theme: ZobiTheme) => css`
  [data-test='dashboard-component-chart-holder']:fullscreen {
    background-color: ${theme.colorBgBase};
    width: 100vw;
    height: 100vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: ${theme.sizeUnit * 4}px;
    overflow: visible;
    position: relative;
    pointer-events: auto;
    z-index: ${theme.zIndexPopupBase};
    opacity: 1;
    visibility: visible;

    /* Ensure children take up available space */
    .dashboard-chart,
    .chart-container,
    .slice_container,
    .chart-slice {
      flex: 1 1 auto;
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow: visible;
    }

    /* Portaled components inside the fullscreen layer */
    .ant-dropdown,
    .ant-tooltip,
    .ant-modal-root,
    .ant-select-dropdown,
    .ant-popover {
      z-index: ${theme.zIndexPopupBase + 1};
      pointer-events: auto;
    }
  }

  /* Interaction and Header fixes */
  [data-test='dashboard-component-chart-holder']:fullscreen * {
    pointer-events: auto;
  }

  [data-test='dashboard-component-chart-holder']:fullscreen
    [data-test='slice-header'] {
    z-index: ${theme.zIndexPopupBase};
    position: relative;
  }
`;
