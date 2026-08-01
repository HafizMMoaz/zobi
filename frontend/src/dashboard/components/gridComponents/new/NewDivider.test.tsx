import { render } from 'spec/helpers/testing-library';

import NewDivider from 'src/dashboard/components/gridComponents/new/NewDivider';

import { NEW_DIVIDER_ID } from 'src/dashboard/util/constants';
import { DIVIDER_TYPE } from 'src/dashboard/util/componentTypes';

jest.mock(
  'src/dashboard/components/gridComponents/new/DraggableNewComponent',
  () =>
    ({ type, id }: { type: string; id: string }) => (
      <div data-test="mock-draggable-new-component">{`${type}:${id}`}</div>
    ),
);

function setup() {
  return render(<NewDivider />);
}

test('should render a DraggableNewComponent', () => {
  const { getByTestId } = setup();
  expect(getByTestId('mock-draggable-new-component')).toBeInTheDocument();
});

test('should set appropriate type and id', () => {
  const { getByTestId } = setup();
  expect(getByTestId('mock-draggable-new-component')).toHaveTextContent(
    `${DIVIDER_TYPE}:${NEW_DIVIDER_ID}`,
  );
});
