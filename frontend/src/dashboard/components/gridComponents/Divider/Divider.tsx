
import { PureComponent } from 'react';
import { css, styled } from '@zobi/core/theme';

import { Draggable } from '../../dnd/DragDroppable';
import HoverMenu from '../../menu/HoverMenu';
import DeleteComponentButton from '../../DeleteComponentButton';
import type { ConnectDragSource } from 'react-dnd';
import type { LayoutItem } from 'src/dashboard/types';

export interface DividerProps {
  id: string;
  parentId: string;
  component: LayoutItem;
  depth: number;
  parentComponent: LayoutItem;
  index: number;
  editMode: boolean;
  handleComponentDrop: (dropResult: unknown) => void;
  deleteComponent: (id: string, parentId: string) => void;
}

const DividerLine = styled.div`
  ${({ theme }) => css`
    width: 100%;
    padding: ${theme.sizeUnit * 2}px 0;
    background-color: transparent;

    &:after {
      content: '';
      height: 1px;
      width: 100%;
      background-color: ${theme.colorSplit};
      display: block;
    }

    div[draggable='true'] & {
      cursor: move;
    }

    .dashboard-component-tabs & {
      padding-left: ${theme.sizeUnit * 4}px;
      padding-right: ${theme.sizeUnit * 4}px;
    }
  `}
`;

class Divider extends PureComponent<DividerProps> {
  constructor(props: DividerProps) {
    super(props);
    this.handleDeleteComponent = this.handleDeleteComponent.bind(this);
  }

  handleDeleteComponent() {
    const { deleteComponent, id, parentId } = this.props;
    deleteComponent(id, parentId);
  }

  render() {
    const {
      component,
      depth,
      parentComponent,
      index,
      handleComponentDrop,
      editMode,
    } = this.props;

    return (
      <Draggable
        component={component}
        parentComponent={parentComponent}
        orientation="row"
        index={index}
        depth={depth}
        onDrop={handleComponentDrop}
        editMode={editMode}
      >
        {({ dragSourceRef }: { dragSourceRef: ConnectDragSource }) => (
          <div ref={dragSourceRef}>
            {editMode && (
              <HoverMenu position="left">
                <DeleteComponentButton onDelete={this.handleDeleteComponent} />
              </HoverMenu>
            )}
            <DividerLine className="dashboard-component dashboard-component-divider" />
          </div>
        )}
      </Draggable>
    );
  }
}

export default Divider;
