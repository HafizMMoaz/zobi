import { render } from '@zobi.dev/core/spec';
import { Divider } from '.';

test('should render', () => {
  const { container } = render(<Divider />);
  expect(container).toBeInTheDocument();
});
