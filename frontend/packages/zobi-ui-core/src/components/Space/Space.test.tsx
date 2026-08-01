import '@testing-library/jest-dom';
import { render } from '@zobi-ui/core/spec';
import { Space } from '.';

test('should render', () => {
  const { container } = render(<Space />);
  expect(container).toBeInTheDocument();
});
