import { render } from '@zobi.dev/core/spec';
import { Input, InputNumber } from '.';

test('should render Input', () => {
  const { container } = render(<Input />);
  expect(container).toBeInTheDocument();
});

test('should render InputNumber', () => {
  const { container } = render(<InputNumber />);
  expect(container).toBeInTheDocument();
});

test('should render TextArea', () => {
  const { container } = render(<Input.TextArea />);
  expect(container).toBeInTheDocument();
});
