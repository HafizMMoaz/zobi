import { render, screen, userEvent } from '@zobi.dev/core/spec';
import ActionCell, { appendDataToMenu } from './index';
import { exampleMenuOptions, exampleRow } from './fixtures';

test('renders with default props', async () => {
  const clickHandler = jest.fn();
  exampleMenuOptions[0].onClick = clickHandler;
  render(<ActionCell menuOptions={exampleMenuOptions} row={exampleRow} />);
  // Open the menu
  await userEvent.click(await screen.findByTestId('dropdown-trigger'));
  // verify all of the menu items are being displayed
  exampleMenuOptions.forEach(async (item, index) => {
    expect(screen.getByText(item.label)).toBeInTheDocument();
    if (index === 0) {
      // verify the menu items' onClick gets invoked
      await userEvent.click(screen.getByText(item.label));
    }
  });
  expect(clickHandler).toHaveBeenCalled();
});

/**
 * Validate that the appendDataToMenu utility function used within the
 * Action cell menu rendering works as expected
 */
test('appendDataToMenu utility', () => {
  exampleMenuOptions.forEach(item => expect(item?.row).toBeUndefined());
  const modifiedMenuOptions = appendDataToMenu(exampleMenuOptions, exampleRow);
  modifiedMenuOptions.forEach(item => expect(item?.row).toBeDefined());
});
