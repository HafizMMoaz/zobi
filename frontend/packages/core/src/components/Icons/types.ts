import Icon, {
  IconComponentProps,
} from '@ant-design/icons/lib/components/Icon';
import { ComponentType, SVGProps } from 'react';

export type AntdIconProps = IconComponentProps;
export type IconType = AntdIconProps & {
  iconColor?: string;
  iconSize?: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
  fileName?: string;
  customIcons?: boolean;
};

export type CustomIconType = ComponentType<SVGProps<SVGSVGElement>>;
export type AntdIconType = typeof Icon;

export interface BaseIconProps {
  component: CustomIconType | AntdIconType;
}
