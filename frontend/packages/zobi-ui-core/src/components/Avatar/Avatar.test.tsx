import { render } from '@zobi-ui/core/spec';
import { Avatar } from '.';

test('renders with default props', async () => {
  const { container } = render(<Avatar />);

  expect(container).toBeInTheDocument();
});
