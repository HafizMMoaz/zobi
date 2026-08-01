import { styled } from '@zobi/core/theme';

const StyledLabelContainer = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;

const StyledLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;

const StyledLabelDetail = styled.span`
  ${({ theme: { fontSizeSM, colorTextSecondary } }) => `
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: ${fontSizeSM}px;
    color: ${colorTextSecondary};
    line-height: 1.6;
    display: block;
  `}
`;

export const OWNER_TEXT_LABEL_PROP = 'textLabel';
export const OWNER_EMAIL_PROP = 'ownerEmail';
export const OWNER_OPTION_FILTER_PROPS = [
  OWNER_TEXT_LABEL_PROP,
  OWNER_EMAIL_PROP,
];

export const OwnerSelectLabel = ({
  name,
  email,
}: {
  name: string;
  email?: string;
}) => (
  <StyledLabelContainer>
    <StyledLabel>{name}</StyledLabel>
    {email && <StyledLabelDetail>{email}</StyledLabelDetail>}
  </StyledLabelContainer>
);
