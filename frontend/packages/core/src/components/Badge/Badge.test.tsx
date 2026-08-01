import { render, screen } from '@zobi.dev/core/spec';
import { Badge } from '.';

const mockedProps = {
  count: 9,
  text: 'Text',
};

test('should render', () => {
  const { container } = render(<Badge {...mockedProps} />);
  expect(container).toBeInTheDocument();
});

test('should render the count', () => {
  render(<Badge {...mockedProps} />);
  expect(screen.getAllByText('9')[0]).toBeInTheDocument();
});

test('should render the text', () => {
  render(<Badge {...mockedProps} />);
  expect(screen.getByText('Text')).toBeInTheDocument();
});
