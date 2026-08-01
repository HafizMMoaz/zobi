import { styled, css } from '@zobi/core/theme';
import { Flex } from '@zobi-ui/core/components';

interface FilterContainerProps {
  width?: number;
}

export const FilterContainer = styled(Flex)<FilterContainerProps>`
  ${({ theme, width }) => css`
    width: ${width ? `${width}px` : 'auto'};

    label {
      display: block;
      font-size: ${theme.fontSizeSM}px;
      color: ${theme.colorTextLabel};
      margin-bottom: ${theme.sizeUnit}px;
    }
    .anticon-info-circle {
      margin: 0px 0px ${theme.sizeUnit}px ${theme.sizeUnit}px;
   }
  }
  `}
`;
