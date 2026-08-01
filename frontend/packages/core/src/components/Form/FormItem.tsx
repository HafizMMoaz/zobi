import { Form } from 'antd';
import { styled } from '@zobi.dev/extension-api/theme';

export const FormItem = styled(Form.Item)`
  ${({ theme }) => `
    &.ant-form-item > .ant-row > .ant-form-item-label {
      padding-bottom: ${theme.paddingXXS}px;
    }
    .ant-form-item-label {
      & > label {
        font-size: ${theme.fontSizeSM}px;
        &.ant-form-item-required:not(.ant-form-item-required-mark-optional) {
          &::before {
            display: none;
          }
          &::after {
            display: inline-block;
            visibility: visible;
            color: ${theme.colorError};
            font-size: ${theme.fontSizeSM}px;
            content: '*';
          }
        }
      }
    }
    .ant-form-item-extra {
      margin-top: ${theme.sizeUnit}px;
      font-size: ${theme.fontSizeSM}px;
    }
  `}
`;
