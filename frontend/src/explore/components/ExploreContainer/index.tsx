import {
  createContext,
  useEffect,
  useState,
  Dispatch,
  FC,
  ReactNode,
  useReducer,
} from 'react';

import { styled } from '@zobi.dev/extension-api/theme';
import { useDragDropManager } from 'react-dnd';
import { DatasourcePanelDndItem } from '../DatasourcePanel/types';

type CanDropValidator = (item: DatasourcePanelDndItem) => boolean;
type DropzoneSet = Record<string, CanDropValidator>;
type Action = { key: string; canDrop?: CanDropValidator };

export const DraggingContext = createContext(false);
export const DropzoneContext = createContext<[DropzoneSet, Dispatch<Action>]>([
  {},
  () => {},
]);
const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const reducer = (state: DropzoneSet = {}, action: Action) => {
  if (action.canDrop) {
    return {
      ...state,
      [action.key]: action.canDrop,
    };
  }
  if (action.key) {
    const newState = { ...state };
    delete newState[action.key];
    return newState;
  }
  return state;
};

const ExploreContainer: FC<{ children?: ReactNode }> = ({ children }) => {
  const dragDropManager = useDragDropManager();
  const [dragging, setDragging] = useState(
    dragDropManager.getMonitor().isDragging(),
  );

  useEffect(() => {
    const monitor = dragDropManager.getMonitor();
    const unsub = monitor.subscribeToStateChange(() => {
      const item = monitor.getItem() || {};
      // don't show dragging state for the sorting item
      if ('dragIndex' in item) {
        return;
      }
      const isDragging = monitor.isDragging();
      setDragging(isDragging);
    });

    return () => {
      unsub();
    };
  }, [dragDropManager]);

  const dropzoneValue = useReducer(reducer, {});

  return (
    <DropzoneContext.Provider value={dropzoneValue}>
      <DraggingContext.Provider value={dragging}>
        <StyledDiv>{children}</StyledDiv>
      </DraggingContext.Provider>
    </DropzoneContext.Provider>
  );
};

export default ExploreContainer;
