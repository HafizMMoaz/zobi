import { useRef, FC } from 'react';

import { styled } from '@zobi/core/theme';

import ItemTitleContainer from './ItemTitleContainer';
import { FilterRemoval } from './types';

interface Props {
  restoreItem: (id: string) => void;
  getItemTitle: (id: string) => string;
  onRearrange: (dragIndex: number, targetIndex: number, itemId: string) => void;
  onRemove: (id: string) => void;
  onChange: (id: string) => void;
  removedItems: Record<string, FilterRemoval>;
  currentItemId: string;
  items: string[];
  erroredItems: string[];
  dataTestId?: string;
  deleteAltText?: string;
  dragType?: string;
  onCrossListDrop?: (
    sourceId: string,
    targetIndex: number,
    sourceType: 'filter' | 'customization',
  ) => void;
}

const TabsContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.sizeUnit * 3}px;
  padding-top: 2px;
`;

const ItemTitlePane: FC<Props> = ({
  getItemTitle,
  onChange,
  onRemove,
  onRearrange,
  restoreItem,
  currentItemId,
  items,
  removedItems,
  erroredItems,
  dataTestId,
  deleteAltText,
  dragType,
  onCrossListDrop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <TabsContainer>
      <ItemTitleContainer
        ref={containerRef}
        items={items}
        currentItemId={currentItemId}
        removedItems={removedItems}
        getItemTitle={getItemTitle}
        erroredItems={erroredItems}
        onChange={onChange}
        onRemove={onRemove}
        onRearrange={onRearrange}
        restoreItem={restoreItem}
        dataTestId={dataTestId}
        deleteAltText={deleteAltText}
        dragType={dragType}
        onCrossListDrop={onCrossListDrop}
      />
    </TabsContainer>
  );
};

export default ItemTitlePane;
