import { styled, css } from '@zobi/core/theme';
import { Form, StyledModal } from '@zobi-ui/core/components';

const MODAL_MARGIN = 16;
const MIN_WIDTH = 880;

export interface BaseModalWrapperProps {
  expanded: boolean;
}

export interface BaseModalBodyProps {
  expanded: boolean;
}

export const BaseModalWrapper = styled(StyledModal)<BaseModalWrapperProps>`
  min-width: ${MIN_WIDTH}px;
  width: ${({ expanded }) => (expanded ? '100%' : MIN_WIDTH)} !important;

  @media (max-width: ${MIN_WIDTH + MODAL_MARGIN * 2}px) {
    width: 100% !important;
    min-width: auto;
  }

  .ant-modal-header {
    margin-bottom: 0;
  }

  .ant-modal-body {
    overflow: hidden;
    padding: 0;
    flex: 1 1 auto;
    min-height: 0;
  }

  .ant-collapse {
    border-bottom: 0;

    .ant-collapse-item:last-child > .ant-collapse-content {
      border-radius: 0;
    }
  }

  ${({ expanded }) =>
    expanded &&
    css`
      height: 100%;

      .ant-modal-body {
        flex: 1 1 auto;
      }
      .ant-modal-content {
        height: 100%;
      }
    `}
`;

export const BaseModalBody = styled.div<BaseModalBodyProps>`
  display: flex;
  height: 100%;
  min-height: 500px;
  flex-direction: row;
  flex: 1;

  .filters-list {
    display: flex;
    flex-direction: column;
  }
`;

export const BaseForm = styled(Form)`
  width: 100%;
`;

export const BaseExpandButtonWrapper = styled.div`
  margin-left: ${({ theme }) => theme.sizeUnit * 4}px;
`;

export const BaseFormItem = styled(Form.Item)<{ expanded?: boolean }>`
  width: ${({ expanded }) => (expanded ? '49%' : '260px')};
`;

export const BaseRowFormItem = styled(Form.Item)<{ expanded?: boolean }>`
  min-width: ${({ expanded }) => (expanded ? '50%' : '260px')};
`;

export const BaseRowSubFormItem = styled(Form.Item)<{ expanded?: boolean }>`
  min-width: ${({ expanded }) => (expanded ? '50%' : '260px')};
`;

export const BaseLabel = styled.span`
  ${({ theme }) => `
    font-size: ${theme.fontSizeSM}px;
    color: ${theme.colorTextSecondary};
  `}
`;

export const BaseAsterisk = styled.span`
  ${({ theme }) => `
    color: ${theme.colorError};
    font-size: ${theme.fontSizeSM}px;
    margin-left: ${theme.sizeUnit - 1}px;

    &:before {
      content: '*';
    }
  `}
`;
