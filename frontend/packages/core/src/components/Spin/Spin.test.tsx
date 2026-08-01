
import { render } from '@zobi.dev/core/spec';
import { Spin } from '.';

test('renders spin with default props', () => {
  render(<Spin />);
  expect(document.querySelector('.ant-spin')).toBeInTheDocument();
});
