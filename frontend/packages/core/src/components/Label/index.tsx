import { Tag } from '@zobi.dev/core/components/Tag';
import { css } from '@emotion/react';
import { useTheme, getColorVariants } from '@zobi.dev/extension-api/theme';
import { DatasetTypeLabel } from './reusable/DatasetTypeLabel';
import { PublishedLabel } from './reusable/PublishedLabel';
import type { LabelProps } from './types';

export function Label(props: LabelProps) {
  const theme = useTheme();
  // Use Ant Design's motion duration instead of deprecated transitionTiming
  const {
    type = 'default',
    monospace = false,
    style,
    onClick,
    children,
    icon,
    id,
    ...rest
  } = props;

  const baseColor = getColorVariants(theme, type);
  const color = baseColor.text;
  const borderColor = baseColor.border;
  const backgroundColor = baseColor.bg;

  const backgroundColorHover = onClick ? baseColor.bgHover : backgroundColor;
  const borderColorHover = onClick ? baseColor.borderHover : borderColor;

  const labelStyles = css`
    transition: background-color ${theme.motionDurationMid};
    white-space: nowrap;
    cursor: ${onClick ? 'pointer' : 'default'};
    overflow: hidden;
    text-overflow: ellipsis;
    background-color: ${backgroundColor};
    border-radius: 8px;
    border-color: ${borderColor};
    padding: 0.35em 0.8em;
    line-height: 1;
    color: ${color};
    display: inline-flex;
    vertical-align: middle;
    align-items: center;
    max-width: 100%;
    &:hover {
      background-color: ${backgroundColorHover};
      border-color: ${borderColorHover};
      opacity: 1;
    }
    ${monospace ? `font-family: ${theme.fontFamilyCode};` : ''}
  `;

  return (
    <Tag
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={style}
      icon={icon}
      css={labelStyles}
      {...rest}
    >
      {children}
    </Tag>
  );
}
export { DatasetTypeLabel, PublishedLabel };
export type { LabelType } from './types';
