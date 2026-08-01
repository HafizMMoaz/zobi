import { ReactElement, cloneElement } from 'react';

import { Dropdown as AntdDropdown, DropdownProps } from 'antd';
import { styled } from '@zobi/core-legacy/theme';
import { Icons } from '@zobi-ui/core/components/Icons';
import {
  IconOrientation,
  type NoAnimationDropdownProps,
  type MenuDotsDropdownProps,
} from './types';

const MenuDots = styled.div`
  width: ${({ theme }) => theme.sizeUnit * 0.75}px;
  height: ${({ theme }) => theme.sizeUnit * 0.75}px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colorFill};

  font-weight: ${({ theme }) => theme.fontWeightNormal};
  display: inline-flex;
  position: relative;

  &:hover {
    background-color: ${({ theme }) => theme.colorPrimary};

    &::before,
    &::after {
      background-color: ${({ theme }) => theme.colorPrimary};
    }
  }

  &::before,
  &::after {
    position: absolute;
    content: ' ';
    width: ${({ theme }) => theme.sizeUnit * 0.75}px;
    height: ${({ theme }) => theme.sizeUnit * 0.75}px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colorFill};
  }

  &::before {
    top: ${({ theme }) => theme.sizeUnit}px;
  }

  &::after {
    bottom: ${({ theme }) => theme.sizeUnit}px;
  }
`;

const MenuDotsWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.sizeUnit * 2}px;
  padding-left: ${({ theme }) => theme.sizeUnit}px;
`;

const RenderIcon = (
  iconOrientation: IconOrientation = IconOrientation.Vertical,
) => {
  const component =
    iconOrientation === IconOrientation.Horizontal ? (
      <Icons.EllipsisOutlined iconSize="xl" />
    ) : (
      <MenuDots />
    );
  return component;
};

export const MenuDotsDropdown = ({
  overlay,
  iconOrientation = IconOrientation.Vertical,
  ...rest
}: MenuDotsDropdownProps) => (
  <AntdDropdown popupRender={() => overlay} {...rest}>
    <MenuDotsWrapper data-test="dropdown-trigger">
      {RenderIcon(iconOrientation)}
    </MenuDotsWrapper>
  </AntdDropdown>
);

export const NoAnimationDropdown = (props: NoAnimationDropdownProps) => {
  const { children, onBlur, onKeyDown, ...rest } = props;
  const childrenWithProps = cloneElement(children as ReactElement, {
    onBlur,
    onKeyDown,
  });

  return (
    <AntdDropdown autoFocus overlayStyle={props.overlayStyle} {...rest}>
      {childrenWithProps}
    </AntdDropdown>
  );
};

export const Dropdown = (props: DropdownProps) => (
  <AntdDropdown autoFocus {...props} />
);

export type { DropdownProps, NoAnimationDropdownProps, MenuDotsDropdownProps };
