import { render, cleanup } from 'spec/helpers/testing-library';

import NewTabs from 'src/dashboard/components/gridComponents/new/NewTabs';

import { NEW_TABS_ID } from 'src/dashboard/util/constants';
import { TABS_TYPE } from 'src/dashboard/util/componentTypes';

// Add cleanup after each test
afterEach(async () => {
  cleanup();
  // Wait for any pending effects to complete
  await new Promise(resolve => setTimeout(resolve, 0));
});

jest.mock(
  'src/dashboard/components/gridComponents/new/DraggableNewComponent',
  () =>
    ({ type, id }: { type: string; id: string }) => (
      <div data-test="mock-draggable-new-component">{`${type}:${id}`}</div>
    ),
);

function setup() {
  return render(<NewTabs />);
}

test('should render a DraggableNewComponent', async () => {
  const { getByTestId } = setup();
  expect(getByTestId('mock-draggable-new-component')).toBeInTheDocument();
});

test('should set appropriate type and id', async () => {
  const { getByTestId } = setup();
  expect(getByTestId('mock-draggable-new-component')).toHaveTextContent(
    `${TABS_TYPE}:${NEW_TABS_ID}`,
  );
});
