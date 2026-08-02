
import { ComponentType } from 'react';
import { css, useTheme, getFontSize } from '@zobi.dev/extension-api/theme';
import { AntdIconType, BaseIconProps, CustomIconType, IconType } from './types';

const genAriaLabel = (fileName: string) => {
  const name = fileName.replace(/_/g, '-'); // Replace underscores with dashes
  const words = name.split(/(?<=[a-z])(?=[A-Z])/); // Split at lowercase-to-uppercase transitions

  if (words.length === 2) {
    return words[0].toLowerCase();
  }

  if (words.length >= 3) {
    return `${words[0].toLowerCase()}-${words[1].toLowerCase()}`;
  }

  return name.toLowerCase();
};

export const BaseIconComponent: React.FC<
  BaseIconProps & Omit<IconType, 'component'>
> = ({
  component: Component,
  iconColor,
  iconSize,
  viewBox,
  customIcons,
  fileName,
  ...rest
}) => {
  const AntdComponent = Component as ComponentType<Record<string, unknown>>;
  const theme = useTheme();
  const whatRole = rest?.onClick ? 'button' : 'img';
  const ariaLabel = genAriaLabel(fileName || '');
  const style = {
    color: iconColor,
    fontSize: iconSize
      ? `${getFontSize(theme, iconSize)}px`
      : `${theme.fontSize}px`,
    cursor: rest?.onClick ? 'pointer' : undefined,
  };

  return customIcons ? (
    <span
      role={whatRole}
      aria-label={ariaLabel}
      data-test={ariaLabel}
      css={[
        css`
          display: inline-flex;
          align-items: center;
          line-height: 0;
          vertical-align: middle;
        `,
      ]}
    >
      <Component
        viewBox={viewBox || '0 0 24 24'}
        style={style}
        width={
          iconSize
            ? `${getFontSize(theme, iconSize) || theme.fontSize}px`
            : `${theme.fontSize}px`
        }
        height={
          iconSize
            ? `${getFontSize(theme, iconSize) || theme.fontSize}px`
            : `${theme.fontSize}px`
        }
        {...(rest as CustomIconType)}
      />
    </span>
  ) : (
    // This branch renders antd icons, which size themselves from `style`. The
    // `component` union also admits SVG components that require explicit
    // width/height, hence the cast.
    <AntdComponent
      role={whatRole}
      style={style}
      aria-label={ariaLabel}
      data-test={ariaLabel}
      {...(rest as AntdIconType)}
    />
  );
};
