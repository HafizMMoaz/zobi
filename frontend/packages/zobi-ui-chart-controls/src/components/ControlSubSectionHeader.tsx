import { styled, css } from '@zobi/core/theme';

export const ControlSubSectionHeader = styled.div`
  ${({ theme }) => css`
    font-weight: ${theme.fontWeightStrong};
    margin-top: ${theme.sizeUnit * 3}px;
    margin-bottom: ${theme.sizeUnit}px;
    font-size: ${theme.fontSizeSM}px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${theme.colorTextSecondary};
  `}
`;
