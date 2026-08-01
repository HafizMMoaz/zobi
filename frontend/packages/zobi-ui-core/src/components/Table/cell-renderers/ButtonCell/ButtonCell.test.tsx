import { render, screen, userEvent } from '@zobi-ui/core/spec';
import ButtonCell from './index';
import { exampleRow } from '../fixtures';

test('renders with default props', async () => {
  const clickHandler = jest.fn();
  const BUTTON_LABEL = 'Button Label';

  render(
    <ButtonCell
      label={BUTTON_LABEL}
      key={5}
      index={0}
      row={exampleRow}
      onClick={clickHandler}
    />,
  );
  await userEvent.click(screen.getByText(BUTTON_LABEL));
  expect(clickHandler).toHaveBeenCalled();
});
