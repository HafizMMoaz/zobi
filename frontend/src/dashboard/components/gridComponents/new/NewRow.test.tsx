import { render, RenderResult } from 'spec/helpers/testing-library';

import NewRow from 'src/dashboard/components/gridComponents/new/NewRow';

import { NEW_ROW_ID } from 'src/dashboard/util/constants';
import { ROW_TYPE } from 'src/dashboard/util/componentTypes';

jest.mock(
  'src/dashboard/components/gridComponents/new/DraggableNewComponent',
  () =>
    ({ type, id }: { type: string; id: string }) => (
      <div data-test="mock-draggable-new-component">{`${type}:${id}`}</div>
    ),
);

function setup(): RenderResult {
  return render(<NewRow />);
}

test('should render a DraggableNewComponent', () => {
  const { getByTestId } = setup();
  expect(getByTestId('mock-draggable-new-component')).toBeInTheDocument();
});

test('should set appropriate type and id', () => {
  const { getByTestId } = setup();
  expect(getByTestId('mock-draggable-new-component')).toHaveTextContent(
    `${ROW_TYPE}:${NEW_ROW_ID}`,
  );
});
