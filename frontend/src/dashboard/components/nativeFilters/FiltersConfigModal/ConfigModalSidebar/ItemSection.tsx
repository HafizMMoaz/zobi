import { FC } from 'react';
import ItemTitlePane from '../ItemTitlePane';
import { FilterRemoval } from '../types';

export interface ItemSectionContentProps {
  currentItemId: string;
  items: string[];
  removedItems: Record<string, FilterRemoval>;
  erroredItems: string[];
  getItemTitle: (id: string) => string;
  onChange: (id: string) => void;
  onRearrange: (dragIndex: number, targetIndex: number, itemId: string) => void;
  onRemove: (id: string) => void;
  restoreItem: (id: string) => void;
  dataTestId: string;
  deleteAltText: string;
  dragType: string;
  isCurrentSection: boolean;
  onCrossListDrop?: (
    sourceId: string,
    targetIndex: number,
    sourceType: 'filter' | 'customization',
  ) => void;
}

const ItemSectionContent: FC<ItemSectionContentProps> = ({
  currentItemId,
  items,
  removedItems,
  erroredItems,
  getItemTitle,
  onChange,
  onRearrange,
  onRemove,
  restoreItem,
  dataTestId,
  deleteAltText,
  dragType,
  isCurrentSection,
  onCrossListDrop,
}) => (
  <ItemTitlePane
    currentItemId={isCurrentSection ? currentItemId : ''}
    items={items}
    removedItems={removedItems}
    erroredItems={erroredItems}
    getItemTitle={getItemTitle}
    onChange={onChange}
    onRearrange={onRearrange}
    onRemove={onRemove}
    restoreItem={restoreItem}
    dataTestId={dataTestId}
    deleteAltText={deleteAltText}
    dragType={dragType}
    onCrossListDrop={onCrossListDrop}
  />
);

export default ItemSectionContent;
