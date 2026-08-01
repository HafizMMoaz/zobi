
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { VariableSizeList as List } from 'react-window';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { Metric, ColumnMeta } from '@zobi-ui/chart-controls';
import { FoldersEditorItemType } from '../types';
import type { FlattenedTreeItem } from './constants';
import type { ItemHeights } from './hooks/useItemHeights';
import type { HeightCache } from './hooks/useHeightCache';
import { useAutoScroll } from './hooks/useAutoScroll';
import {
  VirtualizedTreeItem,
  VirtualizedTreeItemData,
} from './VirtualizedTreeItem';

interface VirtualizedTreeListProps {
  width: number;
  height: number;
  flattenedItems: FlattenedTreeItem[];
  itemHeights: ItemHeights;
  heightCache: HeightCache;
  collapsedIds: Set<string>;
  selectedItemIds: Set<string>;
  editingFolderId: string | null;
  folderChildCounts: Map<string, number>;
  itemSeparatorInfo: Map<string, 'visible' | 'transparent'>;
  visibleItemIds: Set<string>;
  searchTerm: string;
  metricsMap: Map<string, Metric>;
  columnsMap: Map<string, ColumnMeta>;
  isDragging: boolean;
  activeId: UniqueIdentifier | null;
  draggedFolderChildIds: Set<string>;
  forbiddenDropFolderIds: Set<string>;
  currentDropTargetId: string | null;
  onToggleCollapse: (id: string) => void;
  onSelect: (id: string, selected: boolean, shiftKey?: boolean) => void;
  onStartEdit: (id: string) => void;
  onFinishEdit: (id: string, newName: string) => void;
}

export function VirtualizedTreeList({
  width,
  height,
  flattenedItems,
  itemHeights,
  heightCache,
  collapsedIds,
  selectedItemIds,
  editingFolderId,
  folderChildCounts,
  itemSeparatorInfo,
  visibleItemIds,
  searchTerm,
  metricsMap,
  columnsMap,
  isDragging,
  activeId,
  draggedFolderChildIds,
  forbiddenDropFolderIds,
  currentDropTargetId,
  onToggleCollapse,
  onSelect,
  onStartEdit,
  onFinishEdit,
}: VirtualizedTreeListProps) {
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom auto-scroll during drag (replaces dnd-kit's auto-scroll which conflicts with virtualization)
  useAutoScroll({
    listRef,
    containerRef,
    isDragging,
    listHeight: height,
  });

  // Reset list cache when items structure changes, but not during drag
  // Resetting during drag causes jumping/flickering
  useEffect(() => {
    if (!isDragging) {
      listRef.current?.resetAfterIndex(0);
    }
  }, [
    flattenedItems,
    collapsedIds,
    folderChildCounts,
    itemSeparatorInfo,
    visibleItemIds,
    isDragging,
  ]);

  // Calculate item size for react-window
  const getItemSize = useCallback(
    (index: number): number => {
      const item = flattenedItems[index];

      if (!item) {
        return 0;
      }

      const isFolder = item.type === FoldersEditorItemType.Folder;

      // If item doesn't match search, return 0 (hidden)
      if (!isFolder && searchTerm && !visibleItemIds.has(item.uuid)) {
        return 0;
      }

      // Keep the slot height for the active dragged item so horizontal drag
      // can detect "over self" for depth changes. The visual is hidden but
      // the droppable area remains.

      let totalHeight = 0;

      if (isFolder) {
        totalHeight = itemHeights.folderHeader;

        // Add EmptyState height if folder is empty and expanded
        const childCount = folderChildCounts.get(item.uuid) ?? 0;
        const isCollapsed = collapsedIds.has(item.uuid);

        if (childCount === 0 && !isCollapsed) {
          // Use cached height for empty folder or fall back to estimate
          totalHeight +=
            heightCache.getHeight(item.uuid) ?? itemHeights.emptyFolderBase;
        }
      } else {
        totalHeight = itemHeights.regularItem;
      }

      // Add separator height if this item has one
      const separatorType = itemSeparatorInfo.get(item.uuid);
      if (separatorType === 'visible') {
        totalHeight += itemHeights.separatorVisible;
      } else if (separatorType === 'transparent') {
        totalHeight += itemHeights.separatorTransparent;
      }

      return totalHeight;
    },
    [
      flattenedItems,
      itemHeights,
      heightCache,
      collapsedIds,
      folderChildCounts,
      itemSeparatorInfo,
      visibleItemIds,
      searchTerm,
    ],
  );

  // Prepare item data for the row renderer
  const itemData: VirtualizedTreeItemData = useMemo(
    () => ({
      flattenedItems,
      collapsedIds,
      selectedItemIds,
      editingFolderId,
      folderChildCounts,
      itemSeparatorInfo,
      visibleItemIds,
      searchTerm,
      metricsMap,
      columnsMap,
      activeId,
      draggedFolderChildIds,
      forbiddenDropFolderIds,
      currentDropTargetId,
      onToggleCollapse,
      onSelect,
      onStartEdit,
      onFinishEdit,
    }),
    [
      flattenedItems,
      collapsedIds,
      selectedItemIds,
      editingFolderId,
      folderChildCounts,
      itemSeparatorInfo,
      visibleItemIds,
      searchTerm,
      metricsMap,
      columnsMap,
      activeId,
      draggedFolderChildIds,
      forbiddenDropFolderIds,
      currentDropTargetId,
      onToggleCollapse,
      onSelect,
      onStartEdit,
      onFinishEdit,
    ],
  );

  // Use higher overscan during drag to ensure smooth scrolling
  const overscanCount = isDragging ? 20 : 5;

  return (
    <div ref={containerRef} style={{ width, height, position: 'relative' }}>
      <List
        ref={listRef}
        width={width}
        height={height}
        itemCount={flattenedItems.length}
        itemSize={getItemSize}
        itemData={itemData}
        overscanCount={overscanCount}
      >
        {VirtualizedTreeItem}
      </List>
    </div>
  );
}
