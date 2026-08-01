
import { ReactNode, Key, useMemo } from 'react';

import { t } from '@zobi.dev/extension-api/translation';
import { useTruncation } from '@zobi.dev/core';
import { styled } from '@zobi.dev/extension-api/theme';
import { Tooltip } from '@zobi.dev/core/components';

export type TruncatedListProps<ListItemType> = {
  /**
   * Array of input items of type `ListItemType`.
   */
  items: ListItemType[];

  /**
   * Renderer for items not overflowed into the tooltip.
   * Required if `ListItemType` is not renderable by React.
   */
  renderVisibleItem?: (item: ListItemType) => ReactNode;

  /**
   * Renderer for items that are overflowed into the tooltip.
   * Required if `ListItemType` is not renderable by React.
   */
  renderTooltipItem?: (item: ListItemType) => ReactNode;

  /**
   * Returns the React key for an item.
   */
  getKey?: (item: ListItemType) => Key;

  /**
   * The max number of links that should appear in the tooltip.
   */
  maxLinks?: number;
};

const StyledTruncatedList = styled.div`
  & > span {
    width: 100%;
    display: flex;

    .ant-tooltip-open {
      display: inline;
    }
  }
`;

const StyledVisibleItems = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  width: 100%;
  vertical-align: bottom;
`;

const StyledVisibleItem = styled.span`
  &:not(:last-child)::after {
    content: ', ';
  }
`;

const StyledTooltipItem = styled.div`
  .link {
    color: ${({ theme }) => theme.colorTextTertiary};
    display: block;
    text-decoration: underline;
  }
`;

const StyledPlus = styled.span`
  ${({ theme }) => `
  cursor: pointer;
  color: ${theme.colorPrimaryText};
  font-weight: ${theme.fontWeightNormal};
  `}
`;

export default function TruncatedList<ListItemType>({
  items,
  renderVisibleItem = item => item as ReactNode,
  renderTooltipItem = item => item as ReactNode,
  getKey = item => item as unknown as Key,
  maxLinks = 20,
}: TruncatedListProps<ListItemType>) {
  const [itemsNotInTooltipRef, plusRef, elementsTruncated, hasHiddenElements] =
    useTruncation();

  const nMoreItems = useMemo(
    () => (items.length > maxLinks ? items.length - maxLinks : undefined),
    [items, maxLinks],
  );

  const itemsNotInTooltip = useMemo(
    () => (
      <StyledVisibleItems ref={itemsNotInTooltipRef} data-test="crosslinks">
        {items.map(item => (
          <StyledVisibleItem key={getKey(item)}>
            {renderVisibleItem(item)}
          </StyledVisibleItem>
        ))}
      </StyledVisibleItems>
    ),
    [getKey, items, renderVisibleItem],
  );

  const itemsInTooltip = useMemo(
    () =>
      items
        .slice(0, maxLinks)
        .map(item => (
          <StyledTooltipItem key={getKey(item)}>
            {renderTooltipItem(item)}
          </StyledTooltipItem>
        )),
    [getKey, items, maxLinks, renderTooltipItem],
  );

  return (
    <StyledTruncatedList>
      <Tooltip
        placement="top"
        title={
          elementsTruncated ? (
            <>
              {itemsInTooltip}
              {nMoreItems && <span>{t('+ %s more', nMoreItems)}</span>}
            </>
          ) : null
        }
      >
        {itemsNotInTooltip}
        {hasHiddenElements && (
          <StyledPlus ref={plusRef}>+{elementsTruncated}</StyledPlus>
        )}
      </Tooltip>
    </StyledTruncatedList>
  );
}
