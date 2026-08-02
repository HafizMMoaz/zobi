import { render, screen } from 'spec/helpers/testing-library';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableNewComponent from 'src/dashboard/components/gridComponents/new/DraggableNewComponent';
import { CHART_TYPE } from 'src/dashboard/util/componentTypes';

// TODO: rewrite to rtl
// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('DraggableNewComponent', () => {
  const props = {
    id: 'id',
    type: CHART_TYPE,
    label: 'label!',
    className: 'a_class',
  };

  function setup(overrideProps: Record<string, unknown> = {}) {
    return render(
      // @ts-expect-error react-dnd types not updated for React 18
      <DndProvider backend={HTML5Backend}>
        <DraggableNewComponent {...props} {...overrideProps} />
      </DndProvider>,
    );
  }

  beforeEach(() => {
    setup();
  });

  test('should render a DragDroppable', () => {
    expect(screen.getByTestId('dragdroppable-object')).toBeInTheDocument();
  });

  test('should pass component={ type, id } to DragDroppable', () => {
    const dragComponent = screen.getByTestId('dragdroppable-object');
    expect(dragComponent).toHaveClass(
      'dragdroppable dragdroppable--edit-mode dragdroppable-row',
    );
  });

  test('should pass appropriate parent source and id to DragDroppable', () => {
    const dragComponent = screen.getByTestId('new-component');
    expect(dragComponent).toHaveAttribute('draggable', 'true');
  });

  test('should render the passed label', () => {
    expect(screen.getByText(props.label)).toBeInTheDocument();
  });

  test('should add the passed className', () => {
    const component = screen
      .getByTestId('new-component')
      .querySelector('.new-component-placeholder');
    expect(component).toHaveClass(
      `new-component-placeholder ${props.className}`,
    );
  });
});
