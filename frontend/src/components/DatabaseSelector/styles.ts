import { styled } from '@zobi/core/theme';
import { FormLabel } from '@zobi-ui/core/components';

export const StyledFormLabel = styled(FormLabel)`
  display: block;
  font-size: ${({ theme }) => theme.fontSizeSM}px;
  margin-bottom: ${({ theme }) => theme.sizeUnit}px;
`;
