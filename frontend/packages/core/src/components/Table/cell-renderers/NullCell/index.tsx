import { styled } from '@zobi.dev/extension-api/theme';
import { Constants } from '../../..';

const GrayCell = styled.span`
  color: ${({ theme }) => theme.colorTextSecondary};
`;

function NullCell() {
  return <GrayCell>{Constants.NULL_DISPLAY}</GrayCell>;
}

export default NullCell;
