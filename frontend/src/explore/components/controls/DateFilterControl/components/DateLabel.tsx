
import { forwardRef, MouseEvent, ReactNode, RefObject } from 'react';

import { t } from '@zobi/core/translation';
import { css, styled } from '@zobi/core/theme';
import { Icons } from '@zobi-ui/core/components/Icons';

export type DateLabelProps = {
  name?: string;
  label: ReactNode;
  isActive?: boolean;
  isPlaceholder?: boolean;
  onClick?: (event: MouseEvent) => void;
};

const LabelContainer = styled.div<{
  isActive?: boolean;
  isPlaceholder?: boolean;
}>`
  ${({ theme, isActive, isPlaceholder }) => css`
    height: ${theme.sizeUnit * 8}px;

    display: flex;
    align-items: center;
    flex-wrap: nowrap;

    padding: 0 ${theme.sizeUnit * 3}px;

    background-color: ${theme.colorBgContainer};

    border: 1px solid ${isActive ? theme.colorPrimary : theme.colorBorder};
    border-radius: ${theme.borderRadius}px;

    cursor: pointer;

    transition: border-color 0.3s cubic-bezier(0.65, 0.05, 0.36, 1);
    :hover,
    :focus {
      border-color: ${theme.colorPrimary};
    }

    .date-label-content {
      color: ${isPlaceholder ? theme.colorTextPlaceholder : theme.colorText};
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
      flex-shrink: 1;
      white-space: nowrap;
    }

    span[role='img'] {
      color: ${isPlaceholder ? theme.colorTextPlaceholder : theme.colorText};
      margin-left: auto;
      padding-left: ${theme.sizeUnit}px;

      & > span[role='img'] {
        line-height: 0;
      }
    }
  `}
`;

export const DateLabel = forwardRef(
  (props: DateLabelProps, ref: RefObject<HTMLSpanElement>) => (
    <LabelContainer {...props} tabIndex={0} role="button">
      <span
        id={`date-label-${props.name}`}
        className="date-label-content"
        ref={ref}
      >
        {typeof props.label === 'string' ? t(props.label) : props.label}
      </span>
      <Icons.CalendarOutlined iconSize="s" />
    </LabelContainer>
  ),
);
