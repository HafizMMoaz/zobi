import { PureComponent } from 'react';
import cx from 'classnames';
import { css, styled } from '@zobi/core/theme';
import { DragDroppable } from 'src/dashboard/components/dnd/DragDroppable';
import type { ConnectDragSource } from 'react-dnd';
import { NEW_COMPONENTS_SOURCE_ID } from 'src/dashboard/util/constants';
import { NEW_COMPONENT_SOURCE_TYPE } from 'src/dashboard/util/componentTypes';

// Define types for component props
interface DraggableNewComponentProps {
  id: string;
  type: string;
  label: string;
  className?: string;
  meta?: Record<string, any>;
  IconComponent?: any;
}

const NewComponent = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    padding: ${theme.sizeUnit * 4}px;
    background: ${theme.colorBgContainer};
    cursor: move;
    &:not(.static):hover {
      background: ${theme.colorFillContentHover};
    }
  `}
`;

const NewComponentPlaceholder = styled.div`
  ${({ theme }) => css`
    position: relative;
    width: ${theme.sizeUnit * 10}px;
    height: ${theme.sizeUnit * 10}px;
    margin-right: ${theme.sizeUnit * 4}px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.colorTextLabel};
  `}
`;

export default class DraggableNewComponent extends PureComponent<DraggableNewComponentProps> {
  static defaultProps = {
    className: null,
    IconComponent: undefined,
  };

  render() {
    const { label, id, type, className, meta, IconComponent } = this.props;

    return (
      <DragDroppable
        component={{ type, id, meta }}
        parentComponent={{
          id: NEW_COMPONENTS_SOURCE_ID,
          type: NEW_COMPONENT_SOURCE_TYPE,
        }}
        index={0}
        depth={0}
        editMode
      >
        {({ dragSourceRef }: { dragSourceRef: ConnectDragSource }) => (
          <NewComponent ref={dragSourceRef} data-test="new-component">
            <NewComponentPlaceholder
              className={cx('new-component-placeholder', className)}
            >
              {IconComponent && <IconComponent iconSize="xl" />}
            </NewComponentPlaceholder>
            {label}
          </NewComponent>
        )}
      </DragDroppable>
    );
  }
}
