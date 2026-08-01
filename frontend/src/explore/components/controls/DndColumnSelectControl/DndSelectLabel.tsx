import { ReactNode, useCallback, useContext, useEffect, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { t } from '@zobi.dev/extension-api/translation';
import ControlHeader from 'src/explore/components/ControlHeader';
import {
  AddControlLabel,
  DndLabelsContainer,
  HeaderContainer,
} from 'src/explore/components/controls/OptionControls';
import {
  DatasourcePanelDndItem,
  DndItemValue,
} from 'src/explore/components/DatasourcePanel/types';
import { Icons } from '@zobi.dev/core/components/Icons';
import { DndItemType } from '../../DndItemType';
import { DraggingContext, DropzoneContext } from '../../ExploreContainer';

export type DndSelectLabelProps = {
  name: string;
  accept: DndItemType | DndItemType[];
  ghostButtonText: string;
  onDrop: (item: DatasourcePanelDndItem) => void;
  canDrop: (item: DatasourcePanelDndItem) => boolean;
  canDropValue?: (value: DndItemValue) => boolean;
  onDropValue?: (value: DndItemValue) => void;
  valuesRenderer: () => ReactNode;
  displayGhostButton?: boolean;
  onClickGhostButton: () => void;
  isLoading?: boolean;
};

export default function DndSelectLabel({
  displayGhostButton = true,
  accept,
  valuesRenderer,
  isLoading,
  ...props
}: DndSelectLabelProps) {
  const canDropProp = props.canDrop;
  const canDropValueProp = props.canDropValue;

  const dropValidator = useCallback(
    (item: DatasourcePanelDndItem) =>
      canDropProp(item) && (canDropValueProp?.(item.value) ?? true),
    [canDropProp, canDropValueProp],
  );

  const [{ isOver, canDrop }, datasourcePanelDrop] = useDrop({
    accept: isLoading ? [] : accept,

    drop: (item: DatasourcePanelDndItem) => {
      props.onDrop(item);
      props.onDropValue?.(item.value);
    },

    canDrop: dropValidator,

    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      type: monitor.getItemType(),
    }),
  });

  const dispatch = useContext(DropzoneContext)[1];

  useEffect(() => {
    dispatch({ key: props.name, canDrop: dropValidator });
    return () => {
      dispatch({ key: props.name });
    };
  }, [dispatch, props.name, dropValidator]);

  const isDragging = useContext(DraggingContext);

  const values = useMemo(() => valuesRenderer(), [valuesRenderer]);

  function renderGhostButton() {
    return (
      <AddControlLabel
        cancelHover={!props.onClickGhostButton}
        onClick={props.onClickGhostButton}
      >
        <Icons.PlusOutlined iconSize="m" />
        {t(props.ghostButtonText)}
      </AddControlLabel>
    );
  }

  return (
    <div ref={datasourcePanelDrop}>
      <HeaderContainer>
        <ControlHeader {...props} />
      </HeaderContainer>
      <DndLabelsContainer
        data-test="dnd-labels-container"
        canDrop={canDrop}
        isOver={isOver}
        isDragging={isDragging}
        isLoading={isLoading}
      >
        {values}
        {displayGhostButton && renderGhostButton()}
      </DndLabelsContainer>
    </div>
  );
}
