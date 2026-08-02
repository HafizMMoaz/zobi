import { Avatar as AntdAvatar } from 'antd';
import type { AvatarProps, GroupProps as AvatarGroupProps } from './types';

export function Avatar(props: AvatarProps) {
  return <AntdAvatar {...props} />;
}

export function AvatarGroup(props: AvatarGroupProps) {
  return <AntdAvatar.Group {...props} />;
}

export type { AvatarProps, AvatarGroupProps };
