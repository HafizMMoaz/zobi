import { isValidElement, cloneElement } from 'react';
import { css, useTheme } from '@zobi/core/theme';
import { Typography, Icons, TitleProps } from '@zobi-ui/core/components';
import type { IconType } from '@zobi-ui/core/components/Icons/types';

type ModalTitleWithIconProps = Omit<TitleProps, 'title'> & {
  isEditMode?: boolean;
  title: React.ReactNode;
  icon?: IconType;
};

export const ModalTitleWithIcon = ({
  isEditMode,
  title,
  icon,
  level = 5,
  ...rest
}: ModalTitleWithIconProps) => {
  const theme = useTheme();
  const iconStyles = css`
    margin: auto ${theme.sizeUnit * 2}px auto 0;
  `;
  const titleStyles = css`
    && {
      margin: 0;
      margin-bottom: 0;
    }
  `;

  const renderedIcon = isValidElement(icon) ? (
    cloneElement(icon as React.ReactElement, { iconSize: 'l', css: iconStyles })
  ) : isEditMode === true ? (
    <Icons.EditOutlined iconSize="l" css={iconStyles} />
  ) : isEditMode === false ? (
    <Icons.PlusOutlined iconSize="l" css={iconStyles} />
  ) : null;

  return (
    <Typography.Title level={level} css={titleStyles} {...rest}>
      {renderedIcon}
      {title}
    </Typography.Title>
  );
};
