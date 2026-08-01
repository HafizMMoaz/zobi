import { render } from '@zobi-ui/core/spec';
import { Steps } from '.';

test('should render with default props', () => {
  const { container } = render(<Steps />);
  expect(container).toBeInTheDocument();
});
