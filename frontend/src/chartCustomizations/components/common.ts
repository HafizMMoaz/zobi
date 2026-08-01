import { styled } from '@zobi/core/theme';
import { FormItem } from '@zobi-ui/core/components';
import { PluginFilterStylesProps } from './types';

export const RESPONSIVE_WIDTH = 0;

export const FilterPluginStyle = styled.div<PluginFilterStylesProps>`
  min-height: ${({ height }) => height}px;
  width: ${({ width }) => (width === RESPONSIVE_WIDTH ? '100%' : `${width}px`)};
`;

export const StyledFormItem = styled(FormItem)`
  &.ant-row.ant-form-item {
    margin: 0;
  }
`;

export const StatusMessage = styled.div<{
  status?: 'error' | 'warning' | 'info' | 'help';
  centerText?: boolean;
}>`
  color: ${({ theme, status = 'error' }) => {
    if (status === 'help') {
      return theme.colorTextSecondary;
    }
    switch (status) {
      case 'error':
        return theme.colorError;
      case 'warning':
        return theme.colorWarning;
      case 'info':
        return theme.colorInfo;
      default:
        return theme.colorError;
    }
  }};
  text-align: ${({ centerText }) => (centerText ? 'center' : 'left')};
  width: 100%;
`;
