import { styled } from '@zobi.dev/extension-api/theme';
import { Collapse as AntdCollapse } from 'antd';
import type { CollapseProps } from './types';

const StyledCollapse = styled((props: CollapseProps) => (
  <AntdCollapse {...props} />
))`
  ${({ modalMode }) =>
    modalMode &&
    `
      border-radius: 0;
      border-left: 0;
      border-right: 0;
    `}
  .ant-collapse-item {
    .ant-collapse-header {
      .ant-collapse-arrow svg {
        transition: ${({ animateArrows }) =>
          animateArrows ? 'transform 0.24s' : 'none'};
      }

      ${({ expandIconPosition }) =>
        expandIconPosition &&
        expandIconPosition === 'end' &&
        `
            .anticon.anticon-right.ant-collapse-arrow > svg {
              transform: rotate(90deg) !important;
            }
          `}
    }

    ${({ ghost, bordered, theme }) =>
      ghost &&
      bordered &&
      `
        border-bottom: 1px solid ${theme.colorBorderSecondary};
      `}
    .ant-collapse-content {
      color: ${({ theme }) => theme.colorText};

      .ant-collapse-content-box {
        .loading.inline {
          margin: ${({ theme }) => theme.sizeUnit * 12}px auto;
          display: block;
        }
      }
    }
  }

  .hidden-collapse-header .ant-collapse-header {
    display: none;
  }

  .ant-collapse-item-active {
    .ant-collapse-header {
      ${({ expandIconPosition }) =>
        expandIconPosition &&
        expandIconPosition === 'end' &&
        `
            .anticon.anticon-right.ant-collapse-arrow > svg {
              transform: rotate(-90deg) !important;
            }
          `}
    }
  }
`;

// Type-safe extension to preserve Collapse.Panel
type CollapseWithPanel = typeof StyledCollapse & {
  Panel: typeof AntdCollapse.Panel;
};

export const Collapse = StyledCollapse as CollapseWithPanel;
Collapse.Panel = AntdCollapse.Panel;

export type { CollapseProps };
