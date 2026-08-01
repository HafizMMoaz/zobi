import { useRef } from 'react';
import {
  useDrag,
  useDrop,
  DropTargetMonitor,
  DragSourceMonitor,
} from 'react-dnd';
import { DragContainer } from 'src/explore/components/controls/OptionControls';
import {
  OptionProps,
  OptionItemInterface,
} from 'src/explore/components/controls/DndColumnSelectControl/types';
import { Tooltip } from '@zobi-ui/core/components';
import { StyledColumnOption } from 'src/explore/components/optionRenderers';
import { isAdhocColumn } from '@zobi-ui/core';
import { styled } from '@zobi/core/theme';
import { ColumnMeta } from '@zobi-ui/chart-controls';
import Option from './Option';

export const OptionLabel = styled.div`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default function OptionWrapper(
  props: OptionProps & {
    type: string;
    onShiftOptions: (dragIndex: number, hoverIndex: number) => void;
  },
) {
  const {
    index,
    label,
    tooltipTitle,
    column,
    type,
    onShiftOptions,
    clickClose,
    withCaret,
    isExtra,
    datasourceWarningMessage,
    canDelete = true,
    tooltipOverlay,
    multiValueWarningMessage,
    ...rest
  } = props;
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    item: {
      type,
      dragIndex: index,
    },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: type,

    hover: (item: OptionItemInterface, monitor: DropTargetMonitor) => {
      if (!ref.current) {
        return;
      }
      const { dragIndex } = item;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset
        ? clientOffset.y - hoverBoundingRect.top
        : 0;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onShiftOptions(dragIndex, hoverIndex);
      // eslint-disable-next-line no-param-reassign
      item.dragIndex = hoverIndex;
    },
  });

  const shouldShowTooltip =
    (!isDragging && tooltipTitle && label && tooltipTitle !== label) ||
    (!isDragging &&
      labelRef &&
      labelRef.current &&
      labelRef.current.scrollWidth > labelRef.current.clientWidth) ||
    (!isDragging && tooltipOverlay);

  const LabelContent = () => {
    if (!shouldShowTooltip) {
      return <span>{label}</span>;
    }
    if (tooltipOverlay) {
      return (
        <Tooltip overlay={tooltipOverlay}>
          <span>{label}</span>
        </Tooltip>
      );
    }
    return (
      <Tooltip title={tooltipTitle || label}>
        <span>{label}</span>
      </Tooltip>
    );
  };

  const ColumnOption = () => {
    const transformedCol =
      column && isAdhocColumn(column)
        ? { verbose_name: column.label, expression: column.sqlExpression }
        : column;
    return (
      <StyledColumnOption
        column={transformedCol as ColumnMeta}
        labelRef={labelRef}
        showType
      />
    );
  };

  const Label = () => {
    if (label) {
      return (
        <OptionLabel ref={labelRef}>
          <LabelContent />
        </OptionLabel>
      );
    }
    if (column) {
      return (
        <OptionLabel>
          <ColumnOption />
        </OptionLabel>
      );
    }
    return null;
  };

  drag(drop(ref));

  return (
    <DragContainer ref={ref} {...rest}>
      <Option
        index={index}
        clickClose={clickClose}
        withCaret={withCaret}
        isExtra={isExtra}
        datasourceWarningMessage={datasourceWarningMessage}
        canDelete={canDelete}
        multiValueWarningMessage={multiValueWarningMessage}
      >
        <Label />
      </Option>
    </DragContainer>
  );
}
