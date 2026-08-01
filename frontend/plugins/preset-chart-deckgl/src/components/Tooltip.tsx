
import { safeHtmlSpan } from '@zobi-ui/core';
import { styled } from '@zobi/core/theme';
import { ReactNode } from 'react';

export type TooltipProps = {
  tooltip:
    | {
        x: number;
        y: number;
        content: ReactNode;
      }
    | null
    | undefined;
  variant?: 'default' | 'custom';
};

const StyledDiv = styled.div<{
  top: number;
  left: number;
  variant: 'default' | 'custom';
}>`
  ${({ theme, top, left, variant }) => `
    position: absolute;
    top: ${top}px;
    left: ${left}px;
    z-index: 9;
    pointer-events: none;
    ${
      variant === 'default'
        ? `
      padding: ${theme.sizeUnit * 2}px;
      margin: ${theme.sizeUnit * 2}px;
      background: ${theme.colorBgElevated};
      color: ${theme.colorText};
      max-width: 300px;
      font-size: ${theme.fontSizeSM}px;
      border: 1px solid ${theme.colorBorder};
      border-radius: ${theme.borderRadius}px;
      box-shadow: ${theme.boxShadowSecondary};
    `
        : `
      margin: ${theme.sizeUnit * 3}px;
    `
    }
  `}
`;

export default function Tooltip(props: TooltipProps) {
  const { tooltip, variant = 'default' } = props;
  if (typeof tooltip === 'undefined' || tooltip === null) {
    return null;
  }

  const { x, y, content } = tooltip;
  const safeContent =
    typeof content === 'string' ? safeHtmlSpan(content) : content;

  return (
    <StyledDiv top={y} left={x} variant={variant}>
      {safeContent}
    </StyledDiv>
  );
}
