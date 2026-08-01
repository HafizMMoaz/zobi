import { LegacyRef } from 'react';
import { css, styled } from '@zobi/core/theme';
import { Icons } from '@zobi-ui/core/components/Icons';

interface DragHandleProps {
  position: 'left' | 'top';
  innerRef?: LegacyRef<HTMLDivElement> | undefined;
}

const DragHandleContainer = styled.div<{ position: 'left' | 'top' }>`
  ${({ theme, position }) => css`
    height: ${theme.sizeUnit * 5}px;
    overflow: hidden;
    cursor: move;
    ${position === 'top' &&
    css`
      transform: rotate(90deg);
    `}
    & path {
      fill: ${theme.colorIcon};
    }
  `}
`;
export default function DragHandle({
  position = 'left',
  innerRef = null,
}: DragHandleProps) {
  return (
    <DragHandleContainer ref={innerRef} position={position}>
      <Icons.Drag iconSize="xl" />
    </DragHandleContainer>
  );
}
