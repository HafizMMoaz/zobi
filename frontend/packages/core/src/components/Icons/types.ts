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
// Reuse antd's own `component` type rather than restating it: it is a union of
// component shapes, and restating it as a component over a union of props would
// not be assignable, because props are contravariant.
export type AntdIconComponentType = NonNullable<
  IconComponentProps['component']
>;

export interface BaseIconProps {
  component: CustomIconType | AntdIconType | AntdIconComponentType;
}
