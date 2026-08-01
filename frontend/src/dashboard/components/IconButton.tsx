import { MouseEventHandler } from 'react';
import { styled } from '@zobi.dev/extension-api/theme';

interface IconButtonProps {
  icon: JSX.Element;
  label?: string;
  onClick: MouseEventHandler<HTMLDivElement>;
}

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colorIcon};
  &:hover {
    color: ${({ theme }) => theme.colorPrimary};
  }
`;

const StyledSpan = styled.span`
  margin-left: ${({ theme }) => theme.sizeUnit * 2}px;
`;

const IconButton = ({ icon, label, onClick }: IconButtonProps) => (
  <StyledDiv
    tabIndex={0}
    role="button"
    onClick={e => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {icon}
    {label && <StyledSpan>{label}</StyledSpan>}
  </StyledDiv>
);

export default IconButton;
