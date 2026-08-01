import newComponentFactory from 'src/dashboard/util/newComponentFactory';
import {
  DIVIDER_TYPE,
  DASHBOARD_GRID_TYPE,
} from 'src/dashboard/util/componentTypes';
import { screen, render, userEvent } from 'spec/helpers/testing-library';
import Divider, { DividerProps } from './Divider';

// eslint-disable-next-line no-restricted-globals -- TODO: migrate from describe blocks
describe('Divider', () => {
  const baseProps: DividerProps = {
    id: 'id',
    parentId: 'parentId',
    component: newComponentFactory(DIVIDER_TYPE),
    depth: 1,
    parentComponent: newComponentFactory(DASHBOARD_GRID_TYPE),
    index: 0,
    editMode: false,
    handleComponentDrop: jest.fn(),
    deleteComponent: (id: string, parentId: string) => {},
  };

  const setup = (overrideProps: Partial<DividerProps> = {}) =>
    render(<Divider {...baseProps} {...overrideProps} />, {
      useDnd: true,
    });

  test('should render a Draggable', () => {
    setup();
    expect(screen.getByTestId('dragdroppable-object')).toBeInTheDocument();
  });

  test('should render a div with class "dashboard-component-divider"', () => {
    const { container } = setup();
    expect(
      container.querySelector('.dashboard-component-divider'),
    ).toBeInTheDocument();
  });

  test('should render a HoverMenu with DeleteComponentButton in editMode', () => {
    setup();
    expect(screen.queryByTestId('hover-menu')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    setup({ editMode: true });
    expect(screen.getByTestId('hover-menu')).toBeInTheDocument();
    expect(screen.getByRole('button').firstChild).toHaveAttribute(
      'aria-label',
      'delete',
    );
  });

  test('should call deleteComponent when deleted', () => {
    const deleteComponent = jest.fn();
    setup({ editMode: true, deleteComponent });
    userEvent.click(screen.getByRole('button'));
    expect(deleteComponent).toHaveBeenCalledTimes(1);
  });
});
