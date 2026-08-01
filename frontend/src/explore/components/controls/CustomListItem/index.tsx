import { forwardRef, type ReactNode } from 'react';
import { useTheme } from '@zobi/core/theme';
import { List, type ListItemProps } from '@zobi-ui/core/components';

export interface CustomListItemProps extends ListItemProps {
  selectable: boolean;
  children?: ReactNode;
}

const CustomListItem = forwardRef<HTMLDivElement, CustomListItemProps>(
  function CustomListItem(props, ref) {
    const { selectable, children, ...rest } = props;
    const theme = useTheme();
    const css: Record<
      string,
      Record<string, Record<string, number> | string>
    > = {
      '&.ant-list-item': {
        ':first-of-type': {
          borderTopLeftRadius: theme.borderRadius,
          borderTopRightRadius: theme.borderRadius,
        },
        ':last-of-type': {
          borderBottomLeftRadius: theme.borderRadius,
          borderBottomRightRadius: theme.borderRadius,
        },
      },
    };

    if (selectable) {
      css['&:hover'] = {
        cursor: 'pointer',
        backgroundColor: theme.colorFillSecondary,
      };
    }

    return (
      <List.Item ref={ref} {...rest} css={css}>
        {children}
      </List.Item>
    );
  },
);

export default CustomListItem;
