import { forwardRef, useState } from 'react';

import { t } from '@zobi/core/translation';
import { styled } from '@zobi/core/theme';
import { Icons } from '@zobi-ui/core/components/Icons';
import { useDndMonitor } from '@dnd-kit/core';
import {
  verticalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import { FilterRemoval } from './types';
import DraggableFilter from './DraggableFilter';

export const ItemTitle = styled.div`
  ${({ theme }) => `
      display: flex;
      align-items: center;
      padding: ${theme.sizeUnit * 2}px;
      border-radius: ${theme.borderRadius}px;
      cursor: pointer;
      &.active {
        color: ${theme.colorPrimaryActive};
        border-radius: ${theme.borderRadius}px;
        background-color: ${theme.colorPrimaryBg};
        span, .anticon {
          color: ${theme.colorIcon};
        }
      }
      &:hover {
        color: ${theme.colorPrimaryHover};
        span, .anticon {
          color: ${theme.colorPrimaryHover};
        }
      }
      &.errored div, &.errored .warning {
        color: ${theme.colorError};
      }
  `}
`;

const StyledWarning = styled(Icons.ExclamationCircleOutlined)`
  color: ${({ theme }) => theme.colorErrorText};
  &.anticon {
    margin-left: auto;
  }
`;

const Container = styled.div<{ isDragging: boolean }>`
  height: 100%;
  overflow-y: auto;
  ${({ isDragging }) =>
    isDragging &&
    `
    overflow: hidden;
  `}
`;

interface Props {
  getItemTitle: (itemId: string) => string;
  onChange: (itemId: string) => void;
  currentItemId: string;
  removedItems: Record<string, FilterRemoval>;
  onRemove: (id: string) => void;
  restoreItem: (id: string) => void;
  onRearrange: (dragIndex: number, targetIndex: number, itemId: string) => void;
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

const ItemTitleContainer = forwardRef<HTMLDivElement, Props>(
  (
    {
      getItemTitle,
      onChange,
      onRemove,
      restoreItem,
      currentItemId,
      removedItems,
      items,
      erroredItems = [],
      dataTestId = 'item-title-container',
      deleteAltText = 'RemoveItem',
      dragType,
    },
    ref,
  ) => {
    const [isDragging, setIsDragging] = useState(false);

    useDndMonitor({
      onDragStart: () => {
        setIsDragging(true);
      },
      onDragEnd: () => {
        setIsDragging(false);
      },
      onDragCancel: () => {
        setIsDragging(false);
      },
    });

    const renderComponent = (id: string) => {
      const isRemoved = !!removedItems[id];
      const isErrored = erroredItems.includes(id);
      const isActive = currentItemId === id;
      const classNames = [];
      if (isErrored) {
        classNames.push('errored');
      }
      if (isActive) {
        classNames.push('active');
      }
      return (
        <ItemTitle
          role="tab"
          key={`item-title-tab-${id}`}
          onClick={() => onChange(id)}
          className={classNames.join(' ')}
          aria-selected={isActive}
        >
          <div css={{ display: 'flex', width: '100%', alignItems: 'center' }}>
            <div
              css={{
                alignItems: 'center',
                display: 'flex',
                wordBreak: 'break-all',
              }}
            >
              {isRemoved ? t('(Removed)') : getItemTitle(id)}
            </div>
            {!removedItems[id] && isErrored && (
              <StyledWarning className="warning" iconSize="s" />
            )}
            {isRemoved && (
              <span
                css={{ alignSelf: 'flex-end', marginLeft: 'auto' }}
                role="button"
                data-test="undo-button"
                tabIndex={0}
                onClick={e => {
                  e.preventDefault();
                  restoreItem(id);
                }}
              >
                {t('Undo?')}
              </span>
            )}
          </div>
          <div css={{ alignSelf: 'flex-start', marginLeft: 'auto' }}>
            {isRemoved ? null : (
              <Icons.DeleteOutlined
                iconSize="l"
                onClick={(event: React.MouseEvent<HTMLElement>) => {
                  event.stopPropagation();
                  onRemove(id);
                }}
                alt={deleteAltText}
              />
            )}
          </div>
        </ItemTitle>
      );
    };

    return (
      <Container data-test={dataTestId} ref={ref} isDragging={isDragging}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => (
            <DraggableFilter
              key={item}
              id={item}
              index={index}
              filterIds={[item]}
              dragType={dragType}
            >
              {renderComponent(item)}
            </DraggableFilter>
          ))}
        </SortableContext>
      </Container>
    );
  },
);

ItemTitleContainer.displayName = 'ItemTitleContainer';

export default ItemTitleContainer;
