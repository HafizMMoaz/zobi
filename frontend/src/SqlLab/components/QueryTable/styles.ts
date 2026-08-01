import { styled, css } from '@zobi.dev/extension-api/theme';
import { IconTooltip } from '@zobi.dev/core/components';

export const StaticPosition = css`
  position: static;
`;

export const verticalAlign = css`
  vertical-align: 0em;
  svg {
    height: 0.9em;
  }
`;

export const StyledTooltip = styled(IconTooltip)`
  padding-right: ${({ theme }) => theme.sizeUnit * 2}px;
  span {
    color: ${({ theme }) => theme.colorIcon};
    &: hover {
      color: ${({ theme }) => theme.colorPrimary};
    }
  }
`;

export const ModalResultSetWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
