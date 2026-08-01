import { DragLayer, XYCoord } from 'react-dnd';
import { Slice } from 'src/dashboard/types';
import AddSliceCard from '../AddSliceCard';
import {
  NEW_COMPONENT_SOURCE_TYPE,
  CHART_TYPE,
} from '../../util/componentTypes';

interface DragItem {
  index: number;
  parentType: string;
  type: string;
}

interface AddSliceDragPreviewProps {
  dragItem: DragItem | null;
  slices: Slice[] | null;
  isDragging: boolean;
  currentOffset: XYCoord | null;
}

const staticCardStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  top: 0,
  left: 0,
  zIndex: 101, // this should be higher than top-level tabs
  width: 376 - 2 * 16,
};

const AddSliceDragPreview: React.FC<AddSliceDragPreviewProps> = ({
  dragItem,
  slices,
  isDragging,
  currentOffset,
}) => {
  if (!isDragging || !currentOffset || !dragItem || !slices) return null;

  const slice = slices[dragItem.index];

  // make sure it's a new component and a chart
  const shouldRender =
    slice &&
    dragItem.parentType === NEW_COMPONENT_SOURCE_TYPE &&
    dragItem.type === CHART_TYPE;

  return !shouldRender ? null : (
    <AddSliceCard
      style={{
        ...staticCardStyles,
        transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
      }}
      sliceName={slice.slice_name}
      lastModified={slice.changed_on_humanized}
      visType={slice.viz_type}
      datasourceUrl={slice.datasource_url}
      datasourceName={slice.datasource_name}
    />
  );
};

// This injects these props into the component
export default DragLayer(monitor => ({
  dragItem: monitor.getItem() as DragItem | null,
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging(),
}))(AddSliceDragPreview);
