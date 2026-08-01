import { ZobiTheme } from '@zobi.dev/extension-api/theme';
import { Card as AntdCard } from 'antd';
import type { CardProps } from './types';

const CustomCard = ({ padded, ...props }: CardProps) => (
  <AntdCard
    {...props}
    css={(theme: ZobiTheme) => ({
      '.ant-card-body': {
        padding: padded ? theme.sizeUnit * 4 : theme.sizeUnit,
      },
    })}
  />
);

export const Card = Object.assign(CustomCard, {
  Meta: AntdCard.Meta,
});
