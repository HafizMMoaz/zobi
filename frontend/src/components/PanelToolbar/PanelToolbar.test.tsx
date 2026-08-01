import { render, screen } from 'spec/helpers/testing-library';
import userEvent from '@testing-library/user-event';
import PanelToolbar from 'src/components/PanelToolbar';
import {
  registerToolbarAction,
  cleanupExtensions,
} from 'spec/helpers/extensionTestHelpers';

afterEach(cleanupExtensions);

test('click executes registered command callback', async () => {
  const callback = jest.fn();
  registerToolbarAction(
    'test.clickLocation',
    'test-click-cmd',
    'Click Me',
    callback,
  );

  render(<PanelToolbar viewId="test.clickLocation" />);

  await userEvent.click(screen.getByRole('button', { name: 'Click Me' }));
  expect(callback).toHaveBeenCalledTimes(1);
});

test('renders nothing when no actions registered', () => {
  const { container } = render(<PanelToolbar viewId="empty.location" />);
  expect(container).toBeEmptyDOMElement();
});
