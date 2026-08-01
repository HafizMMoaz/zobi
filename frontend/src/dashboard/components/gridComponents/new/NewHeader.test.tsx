import { render } from 'spec/helpers/testing-library';

import NewHeader from 'src/dashboard/components/gridComponents/new/NewHeader';

import { NEW_HEADER_ID } from 'src/dashboard/util/constants';
import { HEADER_TYPE } from 'src/dashboard/util/componentTypes';

jest.mock(
  'src/dashboard/components/gridComponents/new/DraggableNewComponent',
  () =>
    ({ type, id }: { type: string; id: string }) => (
      <div data-test="mock-draggable-new-component">{`${type}:${id}`}</div>
    ),
);

function setup() {
  return render(<NewHeader />);
}

test('should render a DraggableNewComponent', () => {
  const { getByTestId } = setup();
  expect(getByTestId('mock-draggable-new-component')).toBeInTheDocument();
});

test('should set appropriate type and id', () => {
  const { getByTestId } = setup();
  expect(getByTestId('mock-draggable-new-component')).toHaveTextContent(
    `${HEADER_TYPE}:${NEW_HEADER_ID}`,
  );
});
