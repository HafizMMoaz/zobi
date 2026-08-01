import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VariableSizeList as List } from 'react-window';
import { FlattenedItem, Folder } from './types';
import DatasourcePanelItem from './DatasourcePanelItem';

const BORDER_WIDTH = 2;
const HEADER_ITEM_HEIGHT = 50;
const METRIC_OR_COLUMN_ITEM_HEIGHT = 32;
const SUBTITLE_ITEM_HEIGHT = 32;
const DIVIDER_ITEM_HEIGHT = 16;

const flattenFolderStructure = (
  foldersToFlatten: Folder[],
  collapsedFolderIds: Set<string>,
  depth = 0,
  folderMap: Map<string, Folder> = new Map(),
): { flattenedItems: FlattenedItem[]; folderMap: Map<string, Folder> } => {
  const flattenedItems: FlattenedItem[] = [];

  foldersToFlatten.forEach((folder, idx) => {
    folderMap.set(folder.id, folder);

    flattenedItems.push({
      type: 'header',
      folderId: folder.id,
      depth,
      height: HEADER_ITEM_HEIGHT,
    });

    if (!collapsedFolderIds.has(folder.id)) {
      flattenedItems.push({
        type: 'subtitle',
        folderId: folder.id,
        depth,
        height: SUBTITLE_ITEM_HEIGHT,
        totalItems: folder.totalItems,
        showingItems: folder.showingItems,
      });
      folder.items.forEach(item => {
        flattenedItems.push({
          type: 'item',
          folderId: folder.id,
          depth,
          item,
          height: METRIC_OR_COLUMN_ITEM_HEIGHT,
        });
      });

      if (folder.subFolders && folder.subFolders.length > 0) {
        const { flattenedItems: subItems } = flattenFolderStructure(
          folder.subFolders,
          collapsedFolderIds,
          depth + 1,
          folderMap,
        );

        flattenedItems.push(...subItems);
      }
    }
    if (depth === 0 && idx !== foldersToFlatten.length - 1) {
      flattenedItems.push({
        type: 'divider',
        folderId: folder.id,
        depth,
        height: DIVIDER_ITEM_HEIGHT,
      });
    }
  });

  return { flattenedItems, folderMap };
};

interface DatasourceItemsProps {
  width: number;
  height: number;
  folders: Folder[];
}
export const DatasourceItems = ({
  width,
  height,
  folders,
}: DatasourceItemsProps) => {
  const listRef = useRef<List>(null);
  const [collapsedFolderIds, setCollapsedFolderIds] = useState<Set<string>>(
    new Set(
      folders.filter(folder => folder.isCollapsed).map(folder => folder.id),
    ),
  );

  const { flattenedItems, folderMap } = useMemo(
    () => flattenFolderStructure(folders, collapsedFolderIds),
    [folders, collapsedFolderIds],
  );

  const handleToggleCollapse = useCallback((folderId: string) => {
    setCollapsedFolderIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newIds.has(folderId)) {
        newIds.delete(folderId);
      } else {
        newIds.add(folderId);
      }
      return newIds;
    });
  }, []);

  useEffect(() => {
    // reset the list cache when flattenedItems length changes to recalculate the heights
    listRef.current?.resetAfterIndex(0);
  }, [flattenedItems]);

  const getItemSize = useCallback(
    (index: number) => flattenedItems[index].height,
    [flattenedItems],
  );

  const itemData = useMemo(
    () => ({
      flattenedItems,
      folderMap,
      width,
      onToggleCollapse: handleToggleCollapse,
      collapsedFolderIds,
    }),
    [
      flattenedItems,
      folderMap,
      width,
      handleToggleCollapse,
      collapsedFolderIds,
    ],
  );

  return (
    <List
      ref={listRef}
      width={width - BORDER_WIDTH}
      height={height}
      itemSize={getItemSize}
      itemCount={flattenedItems.length}
      itemData={itemData}
      overscanCount={5}
    >
      {DatasourcePanelItem}
    </List>
  );
};
