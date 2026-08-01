import { css, styled } from '@zobi/core-legacy/theme';
import { List as AntdList } from 'antd';
import type { ListProps, ListItemProps, ListItemMetaProps } from './types';

export interface CompactListItemProps extends ListItemProps {
  compact?: boolean;
}

const CompactListItem = styled(AntdList.Item)<CompactListItemProps>`
  && {
    ${({ compact, theme }) =>
      compact &&
      css`
        padding: ${theme.sizeUnit / 2}px ${theme.sizeUnit * 3}px
          ${theme.sizeUnit / 2}px ${theme.sizeUnit}px;
      `}
    ${({ theme }) => css`
      && a {
        color: ${theme.colorLink};
        &:hover {
          color: ${theme.colorLinkHover};
        }
      }
    `}
  }
`;

type CompactListItemWithMeta = typeof CompactListItem & {
  Meta: typeof AntdList.Item.Meta;
};

(CompactListItem as CompactListItemWithMeta).Meta = AntdList.Item.Meta;

export const List = Object.assign(AntdList, {
  Item: CompactListItem,
});

export type { ListProps, ListItemProps, ListItemMetaProps };
