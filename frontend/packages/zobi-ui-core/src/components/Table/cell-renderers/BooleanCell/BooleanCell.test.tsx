import { render, screen } from '@zobi-ui/core/spec';
import { Constants } from '@zobi-ui/core/components';
import BooleanCell from '.';

test('renders true value', async () => {
  render(<BooleanCell value />);
  expect(screen.getByText(Constants.BOOL_TRUE_DISPLAY)).toBeInTheDocument();
});

test('renders false value', async () => {
  render(<BooleanCell value={false} />);
  expect(screen.getByText(Constants.BOOL_FALSE_DISPLAY)).toBeInTheDocument();
});

test('renders falsy value', async () => {
  render(<BooleanCell />);
  expect(screen.getByText(Constants.BOOL_FALSE_DISPLAY)).toBeInTheDocument();
});
