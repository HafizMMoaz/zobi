import { fireEvent, render } from 'spec/helpers/testing-library';
import { OptionControlLabel } from 'src/explore/components/controls/OptionControls';

import DashboardWrapper from './DashboardWrapper';

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

test('should render children', () => {
  const { getByTestId } = render(
    <DashboardWrapper>
      <div data-test="mock-children" />
    </DashboardWrapper>,
    { useRedux: true, useDnd: true },
  );
  expect(getByTestId('mock-children')).toBeInTheDocument();
});

test('should update the style on dragging state', async () => {
  const defaultProps = {
    label: <span>Test label</span>,
    tooltipTitle: 'This is a tooltip title',
    onRemove: jest.fn(),
    onMoveLabel: jest.fn(),
    onDropLabel: jest.fn(),
    type: 'test',
    index: 0,
  };
  const { container, getByText } = render(
    <DashboardWrapper>
      <OptionControlLabel
        {...defaultProps}
        index={1}
        label={<span>Label 1</span>}
      />
      <OptionControlLabel
        {...defaultProps}
        index={2}
        label={<span>Label 2</span>}
      />
    </DashboardWrapper>,
    {
      useRedux: true,
      useDnd: true,
      initialState: {
        dashboardState: {
          editMode: true,
        },
      },
    },
  );
  expect(
    container.getElementsByClassName('dragdroppable--dragging'),
  ).toHaveLength(0);
  fireEvent.dragStart(getByText('Label 1'));
  jest.runAllTimers();
  expect(
    container.getElementsByClassName('dragdroppable--dragging'),
  ).toHaveLength(1);
  fireEvent.dragEnd(getByText('Label 1'));
  // immediately discards dragging state after dragEnd
  expect(
    container.getElementsByClassName('dragdroppable--dragging'),
  ).toHaveLength(0);
});
