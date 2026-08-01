
import { render } from '@zobi-ui/core/spec';
import { Empty } from './Empty';

test('should render', () => {
  const { container } = render(<Empty />);
  expect(container).toBeInTheDocument();
});
