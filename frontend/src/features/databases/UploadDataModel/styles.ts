import { FormItem } from '@zobi.dev/core/components';
import { css, styled, ZobiTheme } from '@zobi.dev/extension-api/theme';

const MODAL_BODY_HEIGHT = 180.5;

export const StyledFormItem = styled(FormItem)`
  ${({ theme }) => css`
    flex: 1;
    margin-top: 0;
    margin-bottom: ${theme.sizeUnit * 2.5}px;
  }
  `}
`;

export const StyledSwitchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0;
`;

export const antDModalNoPaddingStyles = css`
  .ant-modal-body {
    padding-left: 0;
    padding-right: 0;
    padding-top: 0;
  }
`;

export const formStyles = (theme: ZobiTheme) => css`
  .switch-label {
    color: ${theme.colorTextSecondary};
    margin-left: ${theme.sizeUnit * 4}px;
  }
`;

export const antDModalStyles = (theme: ZobiTheme) => css`
  .ant-modal-header {
    padding: ${theme.sizeUnit * 4.5}px ${theme.sizeUnit * 4}px
      ${theme.sizeUnit * 4}px;
  }

  .ant-modal-close-x .close {
    opacity: 1;
  }

  .ant-modal-body {
    height: ${theme.sizeUnit * MODAL_BODY_HEIGHT}px;
  }

  .ant-modal-footer {
    height: ${theme.sizeUnit * 16.25}px;
  }

  .info-solid-small {
    vertical-align: bottom;
  }
`;
