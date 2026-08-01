
import { render } from '@zobi.dev/core/spec';
import { DatePicker, RangePicker } from '.';

test('should render date picker', () => {
  const { container } = render(<DatePicker />);
  expect(container).toBeInTheDocument();
});

test('should render range picker', () => {
  const { container } = render(<RangePicker />);
  expect(container).toBeInTheDocument();
});
