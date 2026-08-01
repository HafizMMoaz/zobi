import { render, screen } from '@zobi-ui/core/spec';
import { Constants } from '../../..';
import NullCell from '.';

test('renders null value', async () => {
  render(<NullCell />);
  expect(screen.getByText(Constants.NULL_DISPLAY)).toBeInTheDocument();
});
