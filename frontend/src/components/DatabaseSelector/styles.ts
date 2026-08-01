import { styled } from '@zobi.dev/extension-api/theme';
import { FormLabel } from '@zobi.dev/core/components';

export const StyledFormLabel = styled(FormLabel)`
  display: block;
  font-size: ${({ theme }) => theme.fontSizeSM}px;
  margin-bottom: ${({ theme }) => theme.sizeUnit}px;
`;
