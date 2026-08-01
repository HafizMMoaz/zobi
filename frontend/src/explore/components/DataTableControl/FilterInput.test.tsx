import { render, screen, userEvent } from 'spec/helpers/testing-library';
import { FilterInput } from '.';

jest.mock('lodash/debounce', () => ({
  __esModule: true,
  default: (fuc: Function) => fuc,
}));

test('Render a FilterInput', async () => {
  const onChangeHandler = jest.fn();
  render(<FilterInput onChangeHandler={onChangeHandler} />);
  expect(await screen.findByRole('textbox')).toBeInTheDocument();

  expect(onChangeHandler).toHaveBeenCalledTimes(0);
  userEvent.type(screen.getByRole('textbox'), 'test');

  expect(onChangeHandler).toHaveBeenCalledTimes(4);
});
