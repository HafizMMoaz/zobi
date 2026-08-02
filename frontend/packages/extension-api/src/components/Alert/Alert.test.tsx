import { render } from '../../testing';
import { Alert } from '.';

test('renders Alert with default props', async () => {
  const { container } = render(<Alert />);
  expect(container).toHaveTextContent('Default message');
});
