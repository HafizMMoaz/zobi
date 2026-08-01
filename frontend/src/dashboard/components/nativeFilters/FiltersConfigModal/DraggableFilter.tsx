import { t } from '@zobi.dev/extension-api/translation';
import { styled } from '@zobi.dev/extension-api/theme';
import type { CSSProperties, FC, ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icons } from '@zobi.dev/core/components/Icons';
import type { IconType } from '@zobi.dev/core/components/Icons/types';
import { isDivider } from './utils';

interface TitleContainerProps {
  readonly isDragging: boolean;
}

export const FILTER_TYPE = 'FILTER';
export const CUSTOMIZATION_TYPE = 'CUSTOMIZATION';

const Container = styled.div<TitleContainerProps>`
  ${({ isDragging }) => `
    opacity: ${isDragging ? 0.3 : 1};
    cursor: ${isDragging ? 'grabbing' : 'pointer'};
    width: 100%;
    display: flex;
  `}
`;

const DragIcon = styled(Icons.Drag, {
  shouldForwardProp: propName => propName !== 'isDragging',
})<IconType & { isDragging: boolean }>`
  ${({ isDragging, theme }) => `
    font-size: ${theme.fontSize}px;
    cursor: ${isDragging ? 'grabbing' : 'grab'};
    padding-left: ${theme.sizeUnit}px;
  `}
`;

interface FilterTabTitleProps {
  id: string;
  index: number;
  filterIds: string[];
  dragType?: string;
  children: ReactNode;
}

export const DraggableFilter: FC<FilterTabTitleProps> = ({
  id,
  index,
  filterIds,
  dragType = FILTER_TYPE,
  children,
}) => {
  const itemId = filterIds[0];
  const isDividerItem = isDivider(itemId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      filterIds,
      index,
      isDivider: isDividerItem,
      dragType,
    },
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Container isDragging={isDragging} {...attributes} {...listeners}>
        <DragIcon
          isDragging={isDragging}
          alt={t('Move icon')}
          viewBox="4 4 16 16"
        />
        <div css={{ flex: 1 }}>{children}</div>
      </Container>
    </div>
  );
};

export default DraggableFilter;
